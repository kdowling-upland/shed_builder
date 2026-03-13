import type { BuildStep } from '../../types/buildPlan.ts';

interface InstructionStepsProps {
  steps: BuildStep[];
}

export function InstructionSteps({ steps }: InstructionStepsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Construction Steps</h3>
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.stepNumber} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {step.stepNumber}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-100 mb-1">{step.title}</h4>
              <p className="text-sm text-gray-300 leading-relaxed">{step.description}</p>
              {step.materials.length > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  Materials: {step.materials.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
