declare module 'play-sound' {
  interface PlayOptions {
    players?: string[];
    [key: string]: any;
  }
  
  interface Player {
    play: (
      filePath: string, 
      callback?: (error: Error | null) => void
    ) => { kill: () => void };
  }
  
  export default function(options?: PlayOptions): Player;
} 