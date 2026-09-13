import React from 'react';
import { Droid88Hub } from '@/components/Droid88Hub';

export default async function DeveloperDashboardDedicatedRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Droid88Hub initialTab="dev_profile" initialDeveloperId={id} />;
}
