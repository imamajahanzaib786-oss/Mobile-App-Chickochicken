Place your local image assets here (for example: chicken.png, burger.png).

How to use them in the app:

1. Put image files into `mobile/assets/`, e.g. `mobile/assets/chicken.png`.
2. Open `mobile/src/assetsMap.ts` and add an entry that maps the filename to a require():

   export const assetsMap: Record<string, any> = {
     'chicken.png': require('../../assets/chicken.png'),
     'burger.png': require('../../assets/burger.png'),
   };

3. In components or data, reference the image using the string path `assets/<filename>` — for example:

   <RemoteImage source={'assets/chicken.png'} />

Notes:
- The mapping uses static `require()` calls so Metro can bundle the files.
- After adding new files and updating `assetsMap.ts`, restart the Metro bundler so it picks up the new assets.
