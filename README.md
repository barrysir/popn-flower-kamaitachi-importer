While the Flower API doesn't have an importer for pop'n set up, here's a web scraper script for your scores page.

1. Paste the script below into the Developer Console: https://gist.githubusercontent.com/barrysir/12094bec6df8e709f7fa3987beb3161f/raw/kailua.js
2. Run the following to download scores as a file on disk:
   1. `downloadAll()` to get scores from every page
   2. `download()` to get scores from the current page
   3. `download(3)` to get scores from a certain page, in this example page 3
   4. `download(3,5)` to get scores from a range of pages, in this example pages 3-5 (inclusive)

NOTE that this script contains its own database of flower song ids -> Kamaitachi ids. This will become out of date as new songs are added, so the script has some code to try and automatically infer the song id mapping. However this code is not perfect, and if it fails it will ask you to manually find the song id. In this case what you need to do:

1. Go to https://kamai.tachi.ac/search
2. Enter in the song name, search for the song
3. Once you identify which is the proper song, look at the URL. It'll look something like `https://kamai.tachi.ac/games/popn/9B/songs/1559/EX` and you want to enter into the prompt `1559`.
4. If it prompts you for the same song again, you can just leave the prompt blank and it'll ignore it.

### Maintenance Guide

todo: write a script which updates for new song ids.