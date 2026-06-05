/**
 * @process seamanship/ui-page-refactor
 * @description Behavior-preserving M3/M7 UI separation for oversized practice and admin pages.
 */

import { defineTask } from "@a5c-ai/babysitter-sdk";

export async function process(inputs, ctx) {
  const inventory = await ctx.task(inventoryTask, inputs);
  const implementation = await ctx.task(implementationTask, {
    ...inputs,
    inventory
  });
  const verification = await ctx.task(verificationTask, {
    ...inputs,
    implementation
  });

  return {
    success: verification.success,
    inventory,
    implementation,
    verification,
    metadata: {
      processId: "seamanship/ui-page-refactor",
      timestamp: ctx.now()
    }
  };
}

export const inventoryTask = defineTask("ui-refactor-inventory", (args, taskCtx) => ({
  kind: "shell",
  title: "Inventory oversized page modules",
  shell: {
    command:
      "wc -l app/practice/page.js app/admin/page.js && find src/components app -maxdepth 4 -type f | sort"
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const implementationTask = defineTask("ui-refactor-implementation", (args, taskCtx) => ({
  kind: "agent",
  title: "Extract practice and admin UI components",
  agent: {
    name: "general-purpose",
    prompt: {
      role: "senior frontend engineer",
      task: args.task,
      context: {
        targetFiles: args.targetFiles,
        requirements: args.requirements,
        inventory: args.inventory
      },
      instructions: [
        "Refactor app/practice/page.js into a small page orchestrator plus focused components under app/practice/_components.",
        "Refactor app/admin/page.js into a small page orchestrator plus focused components under app/admin/_components.",
        "Move pure admin draft/row helpers to src/features/admin/question-draft.js and use them from the page.",
        "Keep imports explicit and route-relative patterns consistent with the repo.",
        "Do not change user-facing behavior, API endpoints, auth behavior, or strings.",
        "Update docs/refactor-plan.md and docs/decision-log.md if the architecture/scope changed.",
        "Return only a concise JSON summary of files changed and validations run."
      ],
      outputFormat: "JSON with filesChanged, summary, validations"
    },
    outputSchema: {
      type: "object",
      required: ["filesChanged", "summary"],
      properties: {
        filesChanged: { type: "array", items: { type: "string" } },
        summary: { type: "string" },
        validations: { type: "array", items: { type: "string" } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const verificationTask = defineTask("ui-refactor-verification", (args, taskCtx) => ({
  kind: "shell",
  title: "Validate UI page refactor",
  shell: {
    command:
      "wc -l app/practice/page.js app/admin/page.js && npm test && npm run build"
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));
