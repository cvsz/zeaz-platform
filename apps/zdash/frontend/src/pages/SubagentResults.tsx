import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubagentResults() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Subagent Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page displays results and outputs from various subagents executing workflows.
            (Content coming soon)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
