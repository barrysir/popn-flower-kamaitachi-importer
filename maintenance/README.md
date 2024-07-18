# Generating the Flower to Kamaitachi song id mapping

For details refer to their respective code files.

I wanted to keep it all Javascript but Python notebook was exactly what I needed. So the main analysis is written as a Python notebook.

## Initial population

First is to download both Flower's and Kamaitachi's song database so we can match them locally.

### Flower

*(Script in `download-flower.js`)*

Flower doesn't have a single page listing every song, but the best candidate I found was a page which lists out every song a player has ever played. Scanning a few players' worth of pages gave id information for the majority of songs. The gaps in the ids represent the remaining songs, and the remaining songs I loaded their song pages individually.

It turns out the majority of the gap ids weren't pointing to any valid song. However I couldn't find a better way of determining whether an id was valid or not, so I just spam-loaded each song page. 

### Kamaitachi

*(Script in `download-kamai.js`)*

Kamaitachi also doesn't have a single song listing, but there is a feature called "Tables", which organizes charts into Folders, and searching a Folder will give us the chart and corresponding song data for all charts in that folder. The disadvantage is that Kamaitachi doesn't have a fixed "All Songs" table we can refer to, instead creating a new table for each version, so this table must be manually found whenever songs are updated. Any missing ids we can then search up individually, similar to Flower.

## Matching

*(Script in `match-songs.ipynb`)*

See the script for more details.

Matching ids consisted of trying different things to match the remaining ids until eventually all of them were matched.
Sometimes I would need to run the data fetching scripts again to get more data, then rerun the matching calculations.


### Something I didn't do: Gap analysis

It turns out that ids in Flower and Kamaitachi increase together, which means we can make good guesses for matches by looking at the corresponding gaps. Suppose kamaitachi 134 maps to flower 280, and kamaitachi 136 maps to flower 285, but we haven't found kamaitachi 135 yet. It would be a good guess to say that kamaitachi 135 lies somewhere between the flower ids, so we could check flower id 281, 282, 283, 284, hoping to get a match.

Similarly for multiple ids, suppose kamaitachi 280 maps to flower 400, and kamaitachi 285 maps to flower 414, we would probably find kamaitachi 281-284 somewhere within flower 401-413. 

This would be a way of making matches without querying as many songs.


## Automatic inference

The script also has some ability to identify id mappings itself to make the script more robust to song additions. It's not very good however, so the song database should be kept up to date as much as possible.