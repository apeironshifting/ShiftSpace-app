'use server';

/**
 * @fileOverview Flow to embed a Spotify playlist into a script.
 *
 * - embedSpotifyPlaylist - A function that embeds a Spotify playlist.
 * - EmbedSpotifyPlaylistInput - The input type for the embedSpotifyPlaylist function.
 * - EmbedSpotifyPlaylistOutput - The return type for the embedSpotifyPlaylist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmbedSpotifyPlaylistInputSchema = z.object({
  playlistLink: z
    .string()
    .describe('The link to the Spotify playlist to embed.'),
});

export type EmbedSpotifyPlaylistInput = z.infer<
  typeof EmbedSpotifyPlaylistInputSchema
>;

const EmbedSpotifyPlaylistOutputSchema = z.object({
  embedCode: z
    .string()
    .describe('The HTML embed code for the Spotify playlist.'),
});

export type EmbedSpotifyPlaylistOutput = z.infer<
  typeof EmbedSpotifyPlaylistOutputSchema
>;

export async function embedSpotifyPlaylist(
  input: EmbedSpotifyPlaylistInput
): Promise<EmbedSpotifyPlaylistOutput> {
  return embedSpotifyPlaylistFlow(input);
}

const embedSpotifyPlaylistPrompt = ai.definePrompt({
  name: 'embedSpotifyPlaylistPrompt',
  input: {schema: EmbedSpotifyPlaylistInputSchema},
  output: {schema: EmbedSpotifyPlaylistOutputSchema},
  prompt: `Given the Spotify playlist link: {{{playlistLink}}}, generate the HTML embed code to display the playlist. Use an iframe with width=\"300\" and height=\"380\".`,
});

const embedSpotifyPlaylistFlow = ai.defineFlow(
  {
    name: 'embedSpotifyPlaylistFlow',
    inputSchema: EmbedSpotifyPlaylistInputSchema,
    outputSchema: EmbedSpotifyPlaylistOutputSchema,
  },
  async input => {
    const {output} = await embedSpotifyPlaylistPrompt(input);
    return output!;
  }
);
