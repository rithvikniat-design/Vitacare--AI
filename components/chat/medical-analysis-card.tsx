import React from "react";
import { FileText, AlertCircle, CheckCircle, Activity, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnalysisResult {
  title: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  technicalDetails?: string;
}

interface MedicalAnalysisCardProps {
  analysis: AnalysisResult;
  className?: string;
}

export function MedicalAnalysisCard({ analysis, className }: MedicalAnalysisCardProps) {
  return (
    <div className={cn("w-full max-w-2xl bg-card border border-border shadow-md rounded-xl overflow-hidden my-4 font-sans", className)}>
      {/* Header */}
      <div className="bg-primary/10 px-5 py-4 border-b border-primary/20 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-full text-primary">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg leading-tight text-foreground">{analysis.title}</h3>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">AI Document Analysis</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-6">
        
        {/* Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-foreground font-medium">
            <FileText className="w-4 h-4 text-primary" />
            <h4>Summary</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        {/* Key Findings */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-foreground font-medium">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <h4>Key Findings</h4>
          </div>
          <ul className="space-y-2">
            {analysis.keyFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-foreground font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h4>Recommendations</h4>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Technical Details (Optional) */}
        {analysis.technicalDetails && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-foreground font-medium">
              <Info className="w-4 h-4 text-muted-foreground" />
              <h4>Technical Details</h4>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-mono leading-relaxed overflow-x-auto">
              {analysis.technicalDetails}
            </div>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="bg-muted px-5 py-3 border-t flex items-start gap-2 text-[11px] text-muted-foreground leading-tight">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer:</strong> This AI analysis is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any medical conditions or results.
        </p>
      </div>
    </div>
  );
}
