'use server';

/**
 * @fileOverview An AI agent for generating initial reality shifting script ideas.
 *
 * - generateShiftScript - A function that generates script ideas based on a theme or prompt.
 * - GenerateShiftScriptInput - The input type for the generateShiftScript function.
 * - GenerateShiftScriptOutput - The return type for the generateShiftScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShiftScriptInputSchema = z.object({
  theme: z
    .string()
    .describe('The theme or prompt for generating the reality shifting script.'),
});
export type GenerateShiftScriptInput = z.infer<typeof GenerateShiftScriptInputSchema>;

const GenerateShiftScriptOutputSchema = z.object({
  scriptIdea: z
    .string()
    .describe('The generated reality shifting script idea based on the theme.'),
});
export type GenerateShiftScriptOutput = z.infer<typeof GenerateShiftScriptOutputSchema>;

export async function generateShiftScript(
  input: GenerateShiftScriptInput
): Promise<GenerateShiftScriptOutput> {
  return generateShiftScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShiftScriptPrompt',
  input: {schema: GenerateShiftScriptInputSchema},
  output: {schema: GenerateShiftScriptOutputSchema},
  prompt: `You are a creative reality shifting script generator. Generate a script idea based on the following theme: {{{theme}}}. The script should be detailed and engaging, providing a solid foundation for the reality shifter to build upon. Focus on creating a unique and immersive experience.

Script Idea:`,
});

const generateShiftScriptFlow = ai.defineFlow(
  {
    name: 'generateShiftScriptFlow',
    inputSchema: GenerateShiftScriptInputSchema,
    outputSchema: GenerateShiftScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
