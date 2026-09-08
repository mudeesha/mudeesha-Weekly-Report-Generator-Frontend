#!/usr/bin/env python3
"""Read-only live contract check. Does not create/update reports, projects or users."""
import argparse
import getpass
import json
import urllib.error
import urllib.parse
import urllib.request


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:8000/api/v1')
    parser.add_argument('--email', required=True)
    args = parser.parse_args()
    base = args.base_url.rstrip('/')
    if not base.startswith(('http://', 'https://')):
        parser.error('--base-url must be an HTTP(S) URL')
    password = getpass.getpass('Account password (not saved): ')

    def call(path, token=None, body=None):
        headers = {'Accept': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        if body is not None:
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
        request = urllib.request.Request(base + path, data=body, headers=headers)
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.load(response)

    try:
        result = call('/auth/login', body=urllib.parse.urlencode({'username': args.email, 'password': password}).encode())
        token = result['access_token']
        user = call('/auth/me', token)
        assert all(field in user for field in ('id', 'name', 'email', 'role')), 'Unexpected /auth/me response'
        print(f'PASS login/me ({user["role"]}); token intentionally not displayed')
        projects = call('/projects', token)
        assert isinstance(projects, list), 'Expected project array'
        assert all('members' in project for project in projects), 'Projects must include members'
        print(f'PASS projects contract ({len(projects)} projects)')
        reports = call('/reports?page=1&page_size=10', token)
        assert all(field in reports for field in ('page', 'page_size', 'total', 'items')), 'Expected paginated report response'
        print(f'PASS reports pagination ({reports["total"]} reports)')
        visible = next((report for report in reports['items'] if user['role'] == 'TEAM_MEMBER' or report['status'] != 'DRAFT'), None)
        if visible:
            detail = call(f'/reports/{visible["id"]}', token)
            version = detail['current_version']
            assert all(field in version for field in ('tasks', 'blockers', 'achievements', 'notes', 'version_number'))
            versions = call(f'/reports/{visible["id"]}/versions', token)
            assert isinstance(versions, list)
            print('PASS report detail and version history contract')
        else:
            print('SKIP detail/history: no readable report in first page')
        if user['role'] in ('ADMIN', 'MANAGER'):
            assert isinstance(call('/users', token), list)
            assert isinstance(call('/dashboard/activity?limit=10', token), list)
            print('PASS directory and activity contract')
        print('Read-only API smoke checks passed. No data mutations were requested.')
    except (urllib.error.URLError, urllib.error.HTTPError, ValueError, KeyError, AssertionError) as error:
        raise SystemExit(f'FAILED: {error}') from None


if __name__ == '__main__':
    main()
