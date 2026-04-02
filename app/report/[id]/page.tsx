import { cache } from "react";
import { supabase } from "../../../lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReportView from "./ReportView";

const getReport = cache(async (id: string) => {
  const { data, error } = await supabase.from("reports").select("*").eq("id", id).single();
  return { data, error };
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data } = await getReport(params.id);
  const business = data?.business?.trim();
  const title = business
    ? `AI Clarity Report – ${business.split(/\s+/).slice(0, 6).join(" ")}`
    : "AI Clarity Report";
  return { title };
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const { data, error } = await getReport(params.id);
  if (error || !data) notFound();
  return <ReportView report={data} />;
}
