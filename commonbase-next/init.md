goal: 

create the simplest no bells and whistles commonbase.

it needs to: 

create and read/write commonbase from local pg file
    use drizzle orm
    commonbase pg table (id: uuid, data: str, metadata: json, created: datetime, updated: datetime)
        FTS extension enabled
    commonbase embedding table (id: uuid, embedding: vector [env.dimensions = 1536])
have a ledger page 
    [shadcn data table] shows the commonbase table rows with list
    checkboxes on side to multi delete rows
have an entry page with neighbors and thread with comment functionality 
    load entry.data into middle of screen as a card with external link to [metadata.title](metadata.source)
    calls the /search api and fetch metadata.links and metadata.backlinks and loads below
    has edit and delete buttons
    has “add to cart” button
    has join button that pops up a search modal where users can select entries to join
have a search page [search bar on top, highlight query matches in results, render images if { type = image } in metadata]
have an add page
    text box and image upload tabs
have a feed page
    infinite scroll do not repeat random ids
have a share page
     get all of the entries in the cart and send them to an llm with prompt that asks to help join these ideas into a cohesive 500 word mini essay.
have a clear cart option
api endpoints
/add
POST { data, metadata, link = null }
create entry uuid -> embed(data) -> add embeddings row to embeddings table and data row to commonbase table
if link not null, update the parent record metadata.backlink by appending comment_id
/addImage
POST { image }
save image to assets/images
use gpt-5 to transcribe image
add (data, metadata { type: image, source: assets/image/url })
/search
POST { query, types = { “semantic” : { options: { limit, threshold } , “fulltext”: { options } } }
return [ { type: “semantic”, similarity: 0.123, data ... }, { type: “fts”, data ... } ]
/random
POST { count, exclude [ ids ... ] }
fetch random row[s] from the commonbase table
/fetch
fetch a row from the commonbase table by id
/update
POST { id, data = null, metadata = null }
if data not null, update row and embed(data)
if metadata not null then update keys passed in ex: { title, source } update metadata.title and metadata.source and leave rest intact
/delete
POST { id }
delete record from commonbase and embeddings table
/list
desc list paginate 20 entries
/join
POST { id, link_ids [] }
append id as metadata.links of requested link_id and append metadata.backlinks[...id] to fetch(link_id)
