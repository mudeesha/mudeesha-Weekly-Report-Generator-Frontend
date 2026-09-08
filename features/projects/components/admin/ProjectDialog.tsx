'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button, HelperText, Input, Label, Textarea } from '@/components/ui/primitives';
import type { Project, ProjectInput } from '@/types';
export function ProjectDialog({ open, project, saving, onClose, onSave }: {
  open: boolean;
  project: Project | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: ProjectInput) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (open) {
      setName(project?.name || '');
      setDescription(project?.description || '');
      setError('');
    }
  }, [open, project]);
  async function save() {
    if (name.trim().length < 2) {
      setError('Use at least 2 characters for the project name.');
      return;
    } await onSave({ name: name.trim(), description: description.trim() || null });
  }
  return <Dialog
    open={open}
    onClose={() => {
      if (!saving)
        onClose();
    }}
    title={project ? 'Edit project' : 'Add project'}
    description="Projects and categories group work across weekly reports."
    footer={<>
      <Button variant="outline" disabled={saving} onClick={onClose}>Cancel</Button>
      <Button disabled={saving} onClick={() => void save()}>
        {saving ? 'Saving…' : 'Save project'}
      </Button>
    </>}>
    <div className="space-y-5">
      <div>
        <Label htmlFor="project-name" required>Project name</Label>
        <Input id="project-name" value={name} onChange={e => setName(e.target.value)} maxLength={150} error={!!error} />
        {error && <HelperText error>
          {error}
        </HelperText>}
      </div>
      <div>
        <Label htmlFor="project-description">Description</Label>
        <Textarea id="project-description" value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={10000} />
      </div>
    </div>
  </Dialog>;
}
