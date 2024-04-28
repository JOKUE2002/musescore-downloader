# Musescore Downloader

Did you ever come across a score on musescore and want to download it as a pdf but notice it is stuck behind a paywall? Kinda sucks.

I mean one could screenshot each page and combine them into a pdf, but that would take time and effort.

This is, why I wrote this little app to do this automatically.

## Installation

Clone the repository, install the packages and run it.

```bash
git clone https://github.com/jokue2002/musescore-downloader
cd musescore-downloader
npm install
node index.js
```

The program will ask you for the URL of the score (e.g. `https://musescore.com/user/35230830/scores/8437241`) and (hopefully) output a file named `score.pdf`.

## Disclaimer

- The program might break or malfunction.
- It works on my machine and might not on your machine.
- Musescore might change the way their website works at any time, which may break the program.
- Musescore might not like you downloading their scores without an account or paying.
- Please don't abuse.

## Issues or problems

As stated above, it works on my machine. The code is documented, so if it doesn't work on your machine, please try to fix it yourself.
