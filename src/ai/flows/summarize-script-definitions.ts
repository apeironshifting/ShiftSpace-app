'use server';

/**
 * @fileOverview A flow that summarizes complex definitions related to reality shifting.
 *
 * - summarizeDefinitions - A function that summarizes definitions.
 * - SummarizeDefinitionsInput - The input type for the summarizeDefinitions function.
 * - SummarizeDefinitionsOutput - The return type for the summarizeDefinitions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDefinitionsInputSchema = z.object({
  definition: z
    .string()
    .describe('The complex definition to summarize and simplify.'),
});
export type SummarizeDefinitionsInput = z.infer<
  typeof SummarizeDefinitionsInputSchema
>;

const SummarizeDefinitionsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A simplified summary of the provided definition.'),
});
export type SummarizeDefinitionsOutput = z.infer<
  typeof SummarizeDefinitionsOutputSchema
>;

export async function summarizeDefinitions(
  input: SummarizeDefinitionsInput
): Promise<SummarizeDefinitionsOutput> {
  return summarizeDefinitionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDefinitionsPrompt',
  input: {schema: SummarizeDefinitionsInputSchema},
  output: {schema: SummarizeDefinitionsOutputSchema},
  prompt: `You are an expert at simplifying complex topics.  Please summarize the following definition in a way that is easy to understand for someone new to the concept:

Definition: {{{definition}}}`,
});

const summarizeDefinitionsFlow = ai.defineFlow(
  {
    name: 'summarizeDefinitionsFlow',
    inputSchema: SummarizeDefinitionsInputSchema,
    outputSchema: SummarizeDefinitionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
