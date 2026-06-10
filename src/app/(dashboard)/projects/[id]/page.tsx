import type { Metadata } from "next";
import { ProjectEditorView } from "@/components/editor/project-editor-view";

export const metadata: Metadata = { title: "Project Editor" };

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectEditorView projectId={id} />;
}
