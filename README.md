While the Flower API doesn't have an importer for pop'n set up, here's a web scraper script for your scores page.

1. Paste the script below into the Developer Console: https://raw.githubusercontent.com/barrysir/popn-flower-kamaitachi-importer/main/popn-flower-scraper.js
2. Run the following to download scores as a file on disk:
   1. `downloadAll()` to get scores from every page
   2. `download()` to get scores from the current page
   3. `download(3)` to get scores from a certain page, in this example page 3
   4. `download(3,5)` to get scores from a range of pages, in this example pages 3-5 (inclusive)
3. On your first import, you'll want to run `downloadAll()` to get all your scores; then to update your profile, you'll want to run `download()`, or something like `download(1,3)` if you had a long session / haven't updated in a while.
4. Use the produced file as the input to Batch Manual import on Kamaitachi.

NOTE that this script contains its own database of flower song ids -> Kamaitachi ids. This will become out of date as new songs are added, so the script has some code to try and automatically infer the song id mapping. However this code is not perfect, and if it fails it will ask you to manually find the song id. In this case what you need to do:

1. Go to https://kamai.tachi.ac/search
2. Enter in the song name, search for the song
3. Once you identify which is the proper song, look at the URL. It'll look something like `https://kamai.tachi.ac/games/popn/9B/songs/1559/EX` and you want to enter into the prompt `1559`.
4. If it prompts you for the same song again, you can just leave the prompt blank and it'll ignore it.

NOTE also that it uses lookup tables for lamps and chart difficulties and if it finds something it doesn't recognize it'll display a prompt. Unfortunately there's not much you can do unless you can read code and add it into the lookup table yourself. Sorry about that.