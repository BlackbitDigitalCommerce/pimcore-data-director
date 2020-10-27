# 2.1.0
Permissions
-----------

You can now allow or disallow configuration and execution of each dataport separately via Pimcore's roles and user permissions.

Pimcore 7 compatibility
-----------------------

-   do not use Pimcore's Webservice API for REST API endpoints (Webservice API gets dropped in Pimcore 7)

-   support symfony/lock (Pimcore\Tool\Lock got deprecated and will be removed in PImcore 7)

-   use twig for templates (PHP templates will not be supported anymore in Pimcore 7)

Auto-map raw data fields
------------------------

Above the attribute mapping panel there now is a button to automatically assign raw data fields to the fields of the import target class. When the raw data field names match the target class field names exactly or approximately (fuzzy lookup is used, so they do not have to be exactly equal), the raw data fields and also the callback functions for complex data types like relations get assigned automatically.

Minor changes
-------------

-   added icon to redo imports from history panel

-   provide logs for all raw items in result callback function

-   support auto-creating raw data fields with zip file as import source

-   bugfix: wrong sort of raw items bugfix: manually edited raw data items got wrong hash for exports with key field(s)

-   bugfix: call result callback function with "lastCall"=true when no objects have been found for given query

-   do not execute imports which have callback functions set but callback function engine is not available

-   enhanced regognition if imported element got changed during import

    -   modificatin check did not work correctly for field collections

    -   trigger preUpdate event handler before comparing element with its latest version → not saving unnecessarily if custom logic in preUpdate event handler changes some object data

    -   do not check for importhash property in isModified

-   support importing to image gallery

-   restart queue processor after max. 1 hour to prevent memory problems

-   bugfix when using special chars like ":" or "," in data query selectors

-   bugfix: show virtual fields in attribute mapping

-   suggest folder for "get-by-path" callback function templates for relation fields when all objects of allowed reference class are in same folder

-   improve auto-complete for data query selectors in Pimcore-based imports/exports

-   bugfix: overlapping imports must not remove any raw data

-   support $params['rawItemData']['fieldName'] in callback functions (of course $params['rawItemData']['fieldName']['value'] will continue to work)

-   bugfix: make callback function panel scrollable

-   enhanced option recognition for select fields: try to find option by label if it cannot get found by key

-   Quantity Value fields: use default unit if no unit has been provided and value is not empty

-   add --dry-run, --objects options for data-director:revert command

-   aliases dd:revert, import:revert as well as dd:deployment:dataport-rebuild, import:deployment:dataport-rebuild did not work

-   add --force option to data-director:revert

-   do not delete asset file on path collision without change (as original and duplicate asset share the same filesystem file)

-   do not throw exception for command dd:delete-rawdata when provided object-id / object-type does not exist - just output message

-   shorten REST API URLs (but old endpoints continue to work)

# 2.0.0

Artificial intelligence
-----------------------

With the checkbox Automatically assign you can now automatically assign elements to a relational field based on artificial intelligence. The training data consists of the data of all mapped fields of this dataport of all published objects of the same class as the imported object. This can e.g. be used to automatically assign categories of a product based on the product name and description.

Virtual Fields
--------------

You can use {{ VARIABLE NAME }} as a placeholder in the callback functions. This will add a *virtual field* with the given name to the attribute mapping panel. Virtual fields can be used for several things:

-   fetch elements via data query selectors and use them for additional logic, e.g.

    php $object = {{ OTHER OBJECT }}; return $object->getField1() ?: $object->getField2();

    This will create a virtual field OTHER OBJECT where we could have return 'Category:name:'.$params['value']; as callback function. This virtual Field will try to find a Category object with the field name being equal to the assigned raw data field. In the field with above callback function we then return either the content of Field1 or if this is empty then the content of Field2 of the returned Category.

-   reusable templates can contain virtual fields. For example the bundle provides a template for uploading export files via FTP. The template defines the virtual fields FTP Host, FTP Port, FTP username, FTP password, FTP Path. You do not have to edit the code provided by the template but can just change the values for these virtual fields.

Virtual fields support getting values from app/config/parameters.yml and .env files. For example when you create export dataports for a shop API, you could put your API credentials in one of those files, in this example in app/config(/parameters.yml:

`parameters: API_ENDPOINT: <http://example.org/api>`

When there is any callback function which uses the placeholder {{ API_ENDPOINT }} the value from parameters.yml will automatically get used - but of course you can override it by assigning a raw data field or implementing a callback function.

### Reuse value of other field

When the name in the double curly braces refers to a really existing field's name (e.g. {{ Key }} for the object key) the field does not get treated as a virtual field but it will contain the mapped return value of the referenced field. For example, when you have a callback function for the object key and want to use the same logic also for the name field of Product objects without duplicating the callback function, then you can use return {{ key }} to get the same value which got returned from the callback function for the field Key.

BC break: Result callback function now only gets 1 raw data item, not a complete batch
--------------------------------------------------------------------------------------

Sadly we cannot adjust already existing result callback functions automatically. The migration just prints a warning for dataports which have a result callback function which then has to be edited manually.

Unpublished versions
--------------------

On the one hand it is important to not overwrite changes of unpublished versions and on the other hand to not publish the changes of unpublished versions. For this reason for elements whose latest version is unpublished, the import gets executed for currently published object version as well as for latest unpublished version - resulting in 2 new versions: one published based on the last published version but including the changes from the import, and one unpublished version based on the latest unpublished version but also including the changes from the import.

For new objects or objects whose latest version is published, of course only one new version will get created (is anything changed during the import).

Import Tags
-----------

You can import one or multiple [tags](https://pimcore.com/docs/latest/Development_Documentation/Tools_and_Features/Tags.html "https://pimcore.com/docs/latest/Development_Documentation/Tools_and_Features/Tags.html"). Tag levels should be separated by /. You can either just assign a raw data field or use a callback function like this

`return ['Tag-Name','hierarchical/tag'];`

Tags which do not exist yet, get automatically created.

Dedicated Logging
-----------------

From the dataport history panel you can now view the logs for each dataport run (rawdata extraction / processing) individually. Additionally the background color of each history panel row gets adjusted based on the worst error which happened during the import run.

Minor enhancements:
-------------------

-   allow plain text input to callback functions (callback function "code" without "return" will get returned as is -> also helps to debug code where the return has been forgotten)

-   correctly update localized fields in currentObjectData

-   provide "transfer" object also for result action function (to use values from result callback function in result action function)

-   allow an arbitrary string to be entered in raw data field in attribute mapping - if it does not exist, use it as callback function

-   remove "Export" as source data class for dataports with source data type "Pimcore"

-   prefix commands by "data-director:" instead of "import:"

    -   rename import:rawdata to dd:extract

    -   rename import:pim to dd:process

-   support running exports based on current raw data

-   start imports via object tree right-click on target folder or asset in import resource folder

-   open object(s) which are referenced by raw data item via right-click

-   repair Open API definition to be able to try API calls directly from REST API documentation overview

-   add auto-complete for item xpath (XML imports)

-   do not open import in new window when importing via right-click on target folder / import asset when dataport has no result callback function

-   allow longer dataport names

-   bugfix: isModified did not work for object bricks

-   simplify asset import by reducing available mapping fields

-   simplify data query selector for Pimcore-based imports: ".:.:.:" is not necessary anymore when fetching fields from source class objects

-   auto-create raw data fields for excel dataports

-   show available variables when editing callback function

-   support importing zip files which include import resource file(s) and assets

-   bugfix: allow save event listeners which apply workflow transitions (due to Pimcore / Symfony bug this was not possible for CLI processes)

-   Write logs to separate files (one per import run), link file object to application logs to be able to get context of errors (e.g. which raw data item, which field etc.)

-   list queued commands in dataport's history panel

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
