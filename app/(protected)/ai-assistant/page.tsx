import { RoleGuard } from '@/components/navigation/RoleGuard';
import { AiAssistantPage } from '@/features/ai/pages/AiAssistantPage';
export default function Page() { return <RoleGuard allow={['MANAGER','ADMIN']}><AiAssistantPage /></RoleGuard>; }
