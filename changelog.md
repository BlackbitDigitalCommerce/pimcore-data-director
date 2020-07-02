# 1.21.0

New name
--------

The new name of this bundle is blackbit/data-director. There are 2 reasons:

1.  Previously this bundle had different names: import bundle and blackbit/pim. It is better to always use the same name so everyone knows which bundle the talk is about

2.  Meanwhile the bundle can do much more than just importing: There are functions for exporting and for internal data generation (e.g. automatic translations, barcode generation etc.). For this reason the name import bundle dod not fit anymore.

Queue commands for automatic dataports
--------------------------------------

Automatic dataports get triggered when a fitting element gets saved or deleted. It is very important that the order of commands is ensured. Previously the commands just got fired in the background. This could lead to server overload due to too many running processes and on the other hand we could never be sure if the command order is kept. For these reasons commands for automatic dataports now get processed via a queue.

Streaming XML Parser
--------------------

XML has the disadvantage that it cannot be parsed line by line but only as a tree. This leads to memory problems with large XML files (e.g. BMEcat files with thousands of products). For XML dataports with simple item xpath (= only tag selectors, no attributes) a new StreamingXmlParser gets used. This reads the input ressource in byte blocks and recognizes when the target item path matches. It then continues to search till it finds the end tag. Then it yields this dataset for processing the raw item data. Then it continues in the import resource. This is a much more memory-efficient way of consuming XML files. For dataports with complex item xpath selectors the old XmlParser does get used.

Other changes
-------------

-   add auto-creation of raw data fields for JSON

-   bugfix: when filtering for a raw data field in attribute mapping and afterwards saving the dataport, only those raw fields got saved which got returned by the search

-   attribute mapping: on change only load preview data of the changed field

-   add lastCall as result callback function parameter

-   bugfix: allow multiple assignment for advanced relations

-   bugfix: allow sorting raw data preview by modified date, id and dataport resource

-   bugfix: do not release lock if import file could not be deleted (otherwise: endless loop)

-   bugfix: release lock if given import file did not exist or had no items

-   bugfix: enable inheritance in raw data field preview

-   bugfix: syntax error in template for image field

-   bugfix: handle everything which contains <*> as HTML / XML in DeepL API

-   use queue in template for dependent import result callback function

-   bugfix: use real current value in attribute mapping preview, not serialized one

-   prevent saving dataport before raw data fields have been loaded -> otherwise all raw data fields are deleted

-   adjust log levels so that the single item import is easier to read (without all the call stacks)

-   prefix compiled data query selector function to prevent conflict with existing functions (e.g. key())

# 1.20.0

Automatic exports
-----------------

An excerpt from the readme:

> When you enable the Run automatically on new data checkbox for export dataports, raw data will always get updated as soon as qualified objects get saved. Only the saved object gets processed during automatic raw data import, not all data objects. This way raw data is always up to date and exports become very fast as the step to fetch the desired data from the data objects is not necessary. You can also consider automatic exports as a CQRS system: Data to be queried gets saved in an optimized way for reading and gets fetched from the write model (Pimcore data objects) only when data changes.

With this feature it is not necessary anymore to fetch any data from data objects in the moment of the request (as long as a request with the same parameters has been done before). No joins or anything which slows down data querying at the moment of user request. I plan to extend this in the future to generate Listing classes which make accessing this data possible even without the REST interface being involved.

Database changes
----------------

As it is possible to have one export dataport which gets called with different SQL conditions or to run one import dataport with multiple files in parallel, I needed a way to determine which raw data item belonged to which condition / file. For this reason I introduced an additional table dataport_resource. A dataport resource belongs to exactly one dataport. It defines the import source (file or SQL condition) and the locale (other parameters will follow in the future). A single raw data item belongs to exactly one dataport resource. This enables the bundle to export exactly the wanted data and also makes parallel imports easier. Previously we used timestamps to identify data for parallel imports - this was kind of hacky and only worked because there were never more than a few imports in parallel. But especially for exports the problem arised when data from the same dataport gets queried at the same time in different languages / with different SQL conditions - without exactly knowing which raw data item belongs to which condition / locale it is impossible to deliver correct results.

Result document actions
-----------------------

This PR adds another special field in attribue mapping:Result document action. With this field you can define what to do with the generated result document. This could be normal output (so the generated document gets sent to the browser), FTP upload, send the document via email etc.

Automatically create raw data fields
------------------------------------

For CSV, XML and Pimcore-based dataports you can now automatically create raw data fields. You only have to provide a sample file which you want to import and the import bundle then creates all raw data fields including Xpaths / data query selectors.

Other changes
-------------

-   Templates for Result callback function for CSV, JSON + XML zip files incl. referenced asset files

-   Template for image fields to automatically generate barcode images

-   execute / download exports via context menu of compatible elements in tree

-   cache data query selector transpiling (resulting PHP code gets saved in file so data query selectors do not have to be parsed again and again for every item)

-   lock objects for Pimcore-based imports so the same object does not get imported multiple times parallely by same dataport

    -   especially important for automatic imports which could call themselves multiple times when the object got saved - only the hash check prevented an endless loop here but it nevertheless was not pretty when saving an object caused the same import to run multiple times

-   prevent raw data fields with duplicate names (caused raw data to be empty for this field)

-   support multi-assignment for advanced relations (assigning same object multiple times)

-   context menu for raw data fields (thanks @Christoph Klöppner )

-   lots of minor bugfixes

# 1.19.0
This PR brings a lot of new features:

-   editable raw data (add / edit raw data in preview panel)

-   Templates for complex import datatypes:

    -   (advanced) many-to-many (object) relation,

    -   field collections,

    -   link

    -   Checkbox

    -   more to come... (as soon as I need them in a customer's project)

-   REST API:

    -   add "all" data query selector helper and support for nested data query selectors to fetch nested data for XML and JSON exports

    -   configurable tag names for exports (data query selector with aliases ("as"))

    -   support for Response object (with headers) in result callback function

    -   locale parameter to determine language of localized fields being accessed in data query selectors

    -   Templates for Result callback function:

        -   CSV,

        -   JSON,

        -   XML,

        -   call dependent import

    -   never cache REST exports without asking server

    -   automatically created OpenAPI specification

    -   add redirect for REST API endpoints if dataport name changes

-   UI bugfixes:

    -   attribute mapping preview

    -   only reload status panel if it is really visible

    -   sort rawdata columns in preview panel by priority (drag-and-drop order)

    -   multiValues checkbox should be editable when in row edit mode

-   cache translations to save costs for translation service provider

-   support importing to link fields

-   create dataport definition file on saving a dataport and add import:deployment:dataport-rebuild command to restore dataport based on these definition file (manually or automatically during deployment)

-   critical bugfix for "optimize inheritance" feature

-   disable "optimize inheritance" for field collections (as inheritance is not supported for field collections in Pimcore)

-   for exports only fetch data of published objects

# 1.18.0
REST interface
--------------

This PR adds REST api endpoints. The REST API works the same as the one integrated in Pimcore.

There are 2 REST endpoints:

-   (GET|POST) http(s)://[YOUR-DOMAIN]/webservice/BlackbitPim/rest/import?apikey=[API-KEY]&dataportId=[Dataport-ID][&async=1]

    -   In the request body you provide the document to be imported.

    -   [API-KEY] is the API key of the Pimcore user, see [Pimcore Webservice documentation](https://pimcore.com/docs/latest/Development_Documentation/Web_Services/index.html#page_Permissions "https://pimcore.com/docs/latest/Development_Documentation/Web_Services/index.html#page_Permissions"). You can only import data to objects which this user has access to.

    -   Example for a CSV import:

        POST http(s)://[YOUR-DOMAIN]/webservice/BlackbitPim/rest/import?apikey=[API-KEY]&dataportId=[Dataport-ID]

        Article number,name 123,My cool product

    -   via import callback function you can generate a response document

    -   requests with async parameter are run in the background. As response you get a URL from which you can fetch the current status and result of the started import (see next bullet point)

-   http(s)://[YOUR-DOMAIN]/webservice/BlackbitPim/rest/status?apikey=[API-KEY]&dataportId=[Dataport-ID]

    -   get result of asynchronous import

    -   as long as HTTP 102 Processing gets returned the import has not finished yet (so the response body contains only data up to the last imported item)

Import result function
----------------------

Not only for REST calls imports now support a "callback function". This can be used to generate result data of the import:

> In attribute mapping there is a special field named Callback function. This function gets executed after one batch of raw data items has been processed. For example you can use this field to:
>
> generate a response document including all successfully imported items and send that to the source system
>
> track import errors
>
> call another import which depends on the current one
>
> create / export documents (JSON / CSV / XML etc.) which other systems can use as import source

Recursive Data Query Selectors
------------------------------

Data query selectors now can be chained so you can also get data of referenced objects:

You can chain data selectors as long as you want. For example Product:articleNo:123:crossSellingProducts:0:manufacturer:name#de first searches for an object with articleNo=123. From this object the first item of the crossSellingProducts many-to-many relation gets fetched. From this object we fetch the assigned manufacturer object (many-to-one relation) whose german name finally gets returned.

It is also possible to apply PHP functions to the returned values, for example to strip HTML tags from a wysiwyg field:

PHP / V8js (JavaScript):

`return 'Class:filterField:filterValue:wysiwygField:strip_tags';`

This way the content of the wysiwyg field gets piped as first argument to the strip_tags function. If you do not want to provide the value as first parameter, you can use %s as placeholder for the value, for example to get selected options of a multiselect field in a comma-separated string:

PHP / V8js (JavaScript):

`return 'Class:filterField:filterValue:multiSelectField:implode(",", %s)';`

Also those function calls can be chained, for example to strip HTML tags and afterwards convert line breaks to <br>you could use:

PHP / V8js (JavaScript):

`return 'Class:filterField:filterValue:wysiwygField:strip_tags:nl2br';`

For convenience there are also some shortcut versions for data query selectors:

-   if you enter . as Class

    -   in attribute mapping the import's target class gets used

        -   e.g. Product:articleNo:123 is equal to .:articleNo:123 for imports with target class Product

    -   for Pimcore-based imports in raw data the source class gets used

        -   e.g. Product:articleNo:123 is equal to .:articleNo:123 for Pimcore-based imports with source class Product

-   if you enter a . for filterField and filterValue

    -   the currently imported object gets used

    -   e.g. Product:.:.:name:de is equal to Product:articleNo:123:name:de when an object with articleNo=123 gets fetched via the key fields of the current raw item row.

-   if you enter a . for filterValue (but have filterField set)

    -   filterValue gets fetched from the current object via the set filterField

    -   e.g. Product:articleNo:.:name:de is equal to Product:articleNo:123:name:de when an object with articleNo=123 gets fetched via the key fields of the current raw item row.

Example:\
For a Pimcore-based import you can access .:.:.:name as raw data field to get the name of the object being currently imported. You could for example use this as placeholder variable in a description text template which gets filled by a Pimcore-based import.

If you want to access the label of a select field option you can access this via :label suffix, for example Product:articleNo:123:mySelectField:label whereas Product:articleNo:123:mySelectField:value and Product:articleNo:123:mySelectField both return the selected option id.

Other minor updates:

-   configurable abortion threshold (max time for one raw data item to be processed until import gets aborted)

-   UI bugfixes