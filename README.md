### Alternatives

 * **https://github.com/HutchyBen/flower-tachi**, supports other games too :)

---

While the Flower API doesn't have an importer for pop'n set up, here's a web scraper script for your scores page.

1. While on your scores page (popn music > Profile), paste the script below into the Developer Console: https://raw.githubusercontent.com/barrysir/popn-flower-kamaitachi-importer/main/popn-flower-scraper.js
2. **NOTE**: This script may bug you with a prompt if it finds something it doesn't recognize. If it does this then read the below section.
3. Run the following to download scores as a file on disk:
   1. `downloadAll()` to get scores from every page
   2. `download()` to get scores from the current page
   3. `download(3)` to get scores from a certain page, in this example page 3
   4. `download(3,5)` to get scores from a range of pages, in this example pages 3-5 (inclusive)
4. On your first import, you'll want to run `downloadAll()` to get all your scores; then to update your profile, you'll want to run `download()`, or something like `download(1,3)` if you had a long session / haven't updated in a while.
5. Use the produced file as the input to a Batch Manual import on Kamaitachi.

### Errors

The script has internal lookup tables for various things and if it finds something it doesn't recognize then it'll raise a prompt.

#### Missing song ID / auto-inference

This script contains its own database of flower song ids -> Kamaitachi ids. This will become out of date as new songs are added, so the script has some code to try and automatically infer the song id mapping. However this code is not perfect, and if it fails it will ask you to manually find the song id. In this case what you need to do:

1. Go to https://kamai.tachi.ac/search
2. Enter in the song name, search for the song
3. Once you identify which is the proper song, look at the URL. It'll look something like `https://kamai.tachi.ac/games/popn/9B/songs/1559/EX` and you want to enter into the prompt `1559`.
4. If it prompts you for the same song again, you can just leave the prompt blank and it'll ignore it.

#### Missing something else

The script also has lookup tables to translate lamps and chart difficulties between score formats. Unfortunately there's not much you can do unless you can read code and add it into the lookup table yourself. Sorry about that.
