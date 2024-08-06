# 3.7.0

### Refactored summary window

To make it easier to understand if an import / export went well, the summary window got refactored. I now features an accordion with 3 sections:

- Errors (including links to elements which were affected)

- Changed elements (including filter for elements which got changed by the import or were not changed + search)

- Result document (for providing the download file or individual result messages

This way data maintainers without technical skills can execute imports and exports (e.g. via main menu links or object wizard forms) and get a visually appealing result summary.

### Reintroduce Adminer

In Pimcore 11 the database administration tool got removed. For Data Director users this meant a big disadvantage because it was not possible anymore to look into the database to try out SQL conditions for dataports. Data Director reintroduces this for Pimcore 11.

Furthermore it adds also some useful features (also for Pimcore <= 10):

- [fix error "Cannot modify header information"](https://github.com/pimcore/pimcore/issues/11304 "https://github.com/pimcore/pimcore/issues/11304")

- auto-suggest for SQL

- sticky table headers to see the column names when you scroll down

- add tooltip for show human readable date format for UNIX timestamps

### Pimcore core improvements

Data Director's purpose is not only to provide a fast and flexible way to implement imports and exports but it cares about all PIM-related tasks. For this reason Data Director adds some useful (yet overridable) defaults to make daily PIM tasks more efficient:

- support browser back / forward button to easier navigate between tabs

- extend context menu for tab panel: add close tabs left / right of current tab

- add button to class definition to start a dataport directly from within editing context

- faster deletion of elements: instead of 2*n sequential AJAX requests, delete all selected elements in 1 background process (incl. put deleted elements to recycle bin)

- auto-sync changed fields if open element got changed by another user / import (if the field value has not been edited by current user)

- show recently opened elements as submenu of "recently opened elements" menu icon

- translatable element tree keys

- live update for calculated value fields

- change quick search behaviour:

- find only elements which contain ALL search terms

- exclude files in import archive folders

There are also some [demonstration videos](https://www.youtube.com/watch?v=apOC8VXcle0&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=13&t=51s&pp=iAQB "https://www.youtube.com/watch?v=apOC8VXcle0&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=13&t=51s&pp=iAQB") to see those core-related tweaks in
action.

### New import / export features

- Implement Template for filling predefined Excel File

- support wildcards (*) for ftp/sftp/ftps import resources, e.g. <ftp://user:password@example.org/import/*.xml>

- support `sftp://username:password@example.org/folder/BMEcat_*.xml | latest` to use wildcards in FTP URLs but still only retrieve the latest (= last modified) file

- add data query selector helper "latestVersionWith": For reviewing / approval workflows objects can have multiple states at the same time:

  Initially the object's data is unapproved. This can be modeled with a checkbox or a select field. After review, the status gets set to approved. Later the data will get updated and the status will become unapproved again. But at this time it may still be necessary to access the latest approved
  data. This can be done with the data query selector latestVersionWith. For example, to retrieve the latest approved name of the object, you can use latestVersionWith#status,approved:name

- latestVersionWith#status,approved will retrieve the latest version which has status=approved and from this version the name gets retrieved

- This way you can create exports which only export approved data

- If you want to use a different comparison operator, use the third parameter, e.g. latestVersionWith#validUntil,2024-01-01,>=.

- support strings as import resource like `{ "sku": {{ type }}, image: {{ image }} }` for a JSON import and dynamically fill placeholders via parameters

### UI improvements

- add status panel to have an overview over all dataport jobs (similar to history panel but for all dataports)

- History panel:

- faster loading of history items

- provide dataport run log files > 100 MB as download and do not try to display in browser

- in case of an error, only show the error message in tooltip of log link, not the whole callback function code

- show parameters as import resource for queued runs of parametrized dataports

- move "extract raw data" and "process raw data" to dropdown if "start complete import / export" button

- dynamically show / hide queue processor button

- preview panel: when processing single raw data items, improve scrolling in log window

- dataport search: support keyword-based search -> search for "import products" will also find dataport "import new products"

### Performance improvements

- when callback function returns object / array, do not serialize whole object but use Importer::getLogOutput() - otherwise objects with loads of related elements would all have to be loaded only for preview

- cache values for fields of type "Calculated value (Data Query Selector)"

- do not queue automatic exports if raw data has not changed since last run → less items in queue

### Minor changes

- Add `fields` selector to retrieve field definitions of classes and object bricks including all their settings

- change detection for field collections: if the same field collection items are present after import but only in different order, do not save

- support translating object brick / classification store field titles via objectbrick:labels#en

- OpenAI integration: support inferring value for field type "country multiselect"

- DeepL translation: support automatic usage of glossaries

- show DD version in Pimcore icon tooltip on bottom left - otherwise there is no possibility to see installed version since "bundles" panel got removed from backend

- add callback function template to convert HTML to Markdown

- SQL condition transpiling: For source data class "Asset", support direct access of properties via propertyName='value'

- if an object got saved 2 times during same second, the queue processor sometimes did not start the automatic dataport because first version did not match dataport's SQL condition and second version was not checked

- support importing localized block fields via #locale syntax, e.g. [ 'fieldName#de' => 'value' ]

- support advanced many-to-many relation as key field

- streamed XML parsing: Better tolerance when same tag appears within data again, e.g.\
  `<Product><related_products><Product></Product></related_products></Product>`

- Mapping panel: separate "other mapped fields" and "environment variables in "available variables" tree"

- translate element keys via admin translations

- attribute mapping: if field type is not supported to be used as key field, add 1=0 as dataport condition and log alert - before this field was skipped without adding any condition, thus a lot of unmatched records got found

- support PHP code for calculated value fields

- support importing field type "table"

- support reading UTF-16 XML files

- bugfix: custom views could get damaged when a class did not have any objects

- support starting object wizard via button and prefill matching fields with data from current object

- support AWS S3 as import resource

- move dataport version files to Pimcore version directory -> easier to add var/bundles/BlackbitDataDirectorBundle to git

- performance improvement for zip exports

- support importing data to dachcom-digital/seo bundle

- execute dataports also for target dependencies (e.g. wehn having publication with many-to-many relation to products, you can right-click publication and export all assigned products

- do not check "view" permission when executing automatic dataports -> otherwise an inconstent state could result:

  1. user only has access to class A

  2. user changes ibject of class A

  3. automatic dataport for source class B gets started for objects which depend on the just saved product of class 
  4. previously: error because triggering user does not have permission for class B -> inconsistent state now: dataport gets executed

# 3.6.0

Performance enhancements
------------------------

- Reduce memory consumption for exports enormously

- build raw item chunks on PHP side to not paginate raw item data in MySQL (raw item ids is not very much memory), before paginating raw item data was rather costly, depending on how much raw items the system has stored (e.g. LIMIT 100000,100 is slow but pagination based on values is also).

- improve change detection for field collections → unchanged field collections get better recognized → data object does not need to be saved → faster imports

- prevent loading remote assets multiple times during imports

- a lot of smaller refactorings to reduce the same code being executed again and again - as import / export tasks normally repeat the logic for all items again and again, there is a lot of potential to save data and thus skip certain program parts

- add cache to Serializer (e.g. used for log output)

- imports: for creating new elements, create new object instead of cloning the item blueprint

Parameterized dataports
-----------------------

Now only parameters which are used in the dataport (e.g. in filter condition or callback functions) will get stored as a dataport resource. This will reduce the number of dataport resources drastically (for example from now it does not make a difference if 2 different users run an export if the
dataport does not use the requesting user as a parameter, e.g. {{ user }}.

In addition parameters now parameters get reused when you only run the process raw data step. Before this was only possible when the parameters got stored in raw data fields.

Multi-step object wizards
-------------------------

Object wizards are forms in the Pimcore backend which you can use to create a user interface for common data maintenance or export tasks. With multi-step object wizards this concept gets even more powerful. In short, a multi-step object wizard is two object wizard dataports which are connected in a
pipeline.

Use-cases:

- Paste a list of product numbers into a text field (dataport 1), parse them and provide them as parameters to dataport 2

- dataport 2 is an object wizard form with a many-to-many object relation. This relation field gets prefilled with the provided data from dataport 1. This way you can check which products have been found and are going to be changed / exported

- Implement branching wizards: Depending in the data of an object wizard form, the next page may be dataport 2 or dataport 3. This way you can set up complex wizards like you know from application installation in Windows / MacOS.

General Pimcore features
------------------------

- track changes of opened objects (e.g. when another user or dataport changes an object, the tab will get reloaded - if there are no changes in the object data)

- in main menu there is an item to open object by id / path. From now there will also be a submenu for each indexed field, e.g. to directly open objects by SKU

- automatically set class icon (if not already set) to random object icon so that different classes have differently colored icons -> easier to distinguish objects of different classes

- automatic tab management: when available width for tab bar gets exceeded, the tab which has not been accessed for longest time, gets closed

- bugfix path formatter: converting absolute full path to relative ones was based on character level - now it is based on folder level to prevent stripping "/products/B" when the only products are /products/Bicycles/A and /products/Belts/B -> before those were shown as "icycles/A" and "elts/B"
  because the common prefix on character level included the "B" from "Bikes" and "Belts" -> now those get displayed as "Bicycles/A" and "Belts/B"

- integration with [dachcom-digital/formbuilder](https://github.com/dachcom-digital/pimcore-formbuilder "https://github.com/dachcom-digital/pimcore-formbuilder"):

- support Data Director as API channel for dachcom-digital/formbuilder -> create frontend form with the form builder and implement processing logic in DD

Dataport settings
-----------------

- support split import data into chunks to run import in multiple parallel processes

- support sorting raw data descending

- Permissions:

- Add "Data Director admin" permission for setups with users who are no Pimcore admins but still are allowed to do EVERYTHING with Data Director

- for newly created dataports, allow access to users with same role as the user who created the dataport

- import archive:

- for URL-based imports name archive file with correct file extension (e.g. .json for a JSON-based import - before it was .tmp) -> archive files' content is accessible when opening assets

- for parametrized imports group archive files by parameters, e.g. for import resource `http://example.org/api?product={{ product }}` put archive file to /archive/ABC when using parameter "product"=ABC

- group archive file folders by date, e.g. before an archive file was named 2024-01-15-12-00-00-example.csv; now it is 2024/01/15/12-00-00-example.csv

Attribute mapping
-----------------

- support importing localized asset metadata with syntax `['fieldname#en' => 'value']`

- add callback function template to convert HTML to text

Dataport run window
-------------------

- add input fields for parameters of a parametrized dataport resource, e.g. when using `http://example.org/api?product={{ product }}` then "product" can be filled in the dataport run window

Other changes
-------------

- support importing all files from folders, even when not using --rm flag

- add french and italian as UI languages

- support creating video thumbnails

- also execute dataports from context menu with force=1 -> otherwise iterative exports will not get re-executed on consecutive calls

- support date fields as key fields

- attribute mapping: better preview for ElementInterface objects (before json_encode() was applied but as almost all fields are protected, almost nothing was shown -> now the element gets serialized)

- JSON parser: support JMESpath / JSON pointer conversion -> data.products is the same as data/products

- JSON parser: support ../ to access JSON data above actual item data

- Pimcore-elements-based exports: support enabling / disabling inheritance for classes which do not allow inheritance but which have localized fields with at least one fallback language

- remove moontoast/math as it is abandoned

- add ObjectBricksOptionProvider: Configure the Options provider class or Service Name in your select field configuration to @DataDirectorObjectBricksOptionProvider. In Options Provider Data enter <className>:<object brick container field>, then your select fields with contain the allowed object
  bricks of the referenced field. A use-case for this is that you can assign on category level which object brick applies to all products which get assigned to this category. For this, you have to set up a dataport which retrieves the brick name of the category and "imports" the corresponding brick
  to the object brick container field. Enable `Run automatically on new data` to automatically run this dataport when a product object gets saved.

# 3.5.0

Pimcore 11 compatibility
------------------------

This version is fully compatible with Pimcore 11!\
Pimcore extracted some bundles from the core product (application logger, reports, redirects etc.). Data Director does not depend on those bundles anymore, so it follows Pimcore standard: Just install the bundles which you need, Data Director will work with any set of installed bundles.\
Beside, we also enhanced compatibility on the opposite direction: Data Director 3.5 is compatible with PHP 7.3, so Pimcore 5 and 6 are still supported.

Separate task for queueing automatic dataports
----------------------------------------------

In former versions the check which automatic dataports shall get queued / started, was done directly when any Pimcore element got saved. When an automatic dataport had a complex SQL query, this could take some time. This applied also to user-triggered saves in Pimcore backend, so they had to wait
until this automatic dataport queueing had been finished. Now this queueing got delegated to a separate task, so that saving an element is as fast as it would be without Data Director.\
This separate queueing taks is named `data-director:start-automatic-dataports` and gets executed by the usual queue processor.

Automatic testing of dataports
------------------------------

With the command `bin/console data-director:create-test <Dataport ID>` you can create a PHPUnit test for the given dataport. Based on the currently existing raw items and mapping a test class will get created. You can run those automatic tests via PHPUnit.

Main purposes for automatic tests:

1. Assure that after changes in dataport settings or attribute mapping everything works the same as before.

2. Assure that before and after updates / modifications of underlying libraries like Pimcore or Data Director itself, everything still works as before.

To run the tests a `phpunit.xml` is needed. If this does not already exist in the Pimcore root folder, it will also get automatically created. If it already exists, a new test suite will get added to it.\
The command will display instructions how to run to tests.

Dataport synchronisation between multiple Pimcore systems
---------------------------------------------------------

The `data-director:deployment:dataport-rebuild` can now also be used to synchronize dataports between multiple Pimcore systems. There are 2 new REST endpoints:

- `GET http(s)://<YOUR-DOMAIN>/api/dataports?apikey=<API key>`

    - returns a JSON list of dataports which the user given by `apikey` is allowed to configure

- `GET http(s)://<YOUR-DOMAIN>/api/dataports/<dataport id or name>?apikey=<API key>`

    - returns the dataport configuration as JSON (which can be used to set up dataports via `data-director:deployment:dataport-rebuild` command (same as when exporting dataport configuration or when using Git for storing JSON configuration files)

To import dataports from a remote system, you can call `bin/console data-director:deployment:dataport-rebuild --source=https://other-pimcore.com --api-key=<API key>`. As optional argument you can provide the dataport id / name to retrieve - otherwise all dataports will get fetched.

When working with remote source, only dataports whose latest version has been imported or which do not exist yet, will get imported. For already existing dataports whose latest version has been edited by a real user, you will get asked if you want to overwrite the local dataport configuration (to
prevent local changes from being overwritten). As soon as you allow the import, the latest version will be marked as been imported and thus can be synced automatically in future. If you want to always overwrite local changes, use the `--force` flag.

UI changes
----------

### Pimcore perspective

[Pimcore perspectives](https://pimcore.com/docs/pimcore/10.6/Development_Documentation/Tools_and_Features/Perspectives.html "https://pimcore.com/docs/pimcore/10.6/Development_Documentation/Tools_and_Features/Perspectives.html") are a powerful yet often unused feature of Pimcore. Data Director
provides a basic perspective based on the data object classes' groups. All data object classes which belong to the same `group` get shown in the same perspective panel. The root folder gets automatically optimized to the lowest parent object which contains all objects of the corresponding class.

The perspective also comes with a dashboard which includes a queue monitor, tagged elements and dataport errors portlets. Of course those portlets are also usable in other dashboards (e.g. the tagged elements portlet could be used as a todo list).

### Element tree tooltips

By default Pimcore only shows the element id and class when hovering an element in the tree. This information is seldom of great use. Data Director now ships with a default tooltip, which shows all fields which are configured to be shown in search window, also in the tooltip.

### Path formatter for assets

The `@DataDirectorSearchViewPathFormatter` and `@DataDirectorGridViewPathFormatter` now support displaying asset metadata for asset-based relations.\
Furthermore they now support direct editing for MS Office tools for Excel, Word, Powerpoint assets: the shown asset path gets linked - when you click it, the asset gets opened in MS Office. All saved changes will be directly reflected in Pimcore (
via [Pimcore's WebDAV interface](https://pimcore.com/docs/pimcore/10.6/Development_Documentation/Assets/Accessing_Assets_via_WebDAV.html "https://pimcore.com/docs/pimcore/10.6/Development_Documentation/Assets/Accessing_Assets_via_WebDAV.html")).

### Dataport settings

- support copying multiple raw data fields

- simplify accessing complex import resources

    - support direct input of PHP / shell code, e.g. to access data from OAuth2 APIs → no need to create a separate script file anymore

    - support using PHP code as import resource which returns a URL (e.g. HTTP, FTP, Pimcore Asset path) -> this way the script can focus on the logic to generate the URL while delegating the code to actually access the resource to Data Director

- support querying asset metadata fields in SQL condition via their name, e.g. metaField=1

- support placeholders in target folder / asset target folder (e.g. when providing target folder in dependent dataport parameters)

### Attribute mapping

- enhanced loading performance of attribute mapping panel

- callback function window: in available variables tree, load single raw item fields as sub-tree of `$params['rawItemData']`. Same for single fields of `$params['currentObjectData']`

- save dataport version first, then process attribute mapping example data -> this way in case of critical syntax errors in one of the callback functions you can still revert to the previous version

- fields which got mapped via "automatic mapping" button do not get automatically saved anymore but you can review the mapping result and at the end save it

- add checkbox for `path` mapping to delete child elements before import (same as `Truncate before import` for relational fields)

Other changes
-------------

- SQL condition: support filtering for metadata columns of advanced many-to-many object relations, e.g. markets.active=1 for an advanced many-to-many relation "markets" with boolean meta field "active"

- for remote dataport resources reduce number of file copies

- add result callback function template for Excel export

- identical raw data items do not get processed multiple times anymore when running `dd:process`

- support importing quantity value strings with thousand separator like 1.234,56 kg

- enhanced logging: add logs to dataport run log which get logged via \Pimcore\Logger::error() and similar methods

- add support for inferring field values from texts via ChatGPT API for advanced many-to-many relations

- change virtual field resolving priority, e.g. {{ field }}:

    - if the field "field" really exists in the target class, use the return value of this (for reusing return values of other fields)

    - use the request parameter "field"

    - use the raw item data field with name "field"

    - and 3. were the other way around which caused problems with dependent dataport parameters when the called dataport had a raw data field with the same name - then there was no way to access the parameter

- serialization bugfix: export boolean values as 0/1 -> was "true"/"false" in some cases

- only provide environment variables which actually get used in callback functions -> reduce memory usage

- support SQL query optimizations for localized relation fields like relationField#de LIKE '%,1234,%' - up to now only non-localized fields were supported

- support accessing localized classification store via data query selector `classificationStore#en`

- data query selector for classification store: support syntax `classificationStoreField:groupName` (returns key-value array of all fields of the group) and `classificationStoreField:groupName:fieldName` (returns value of the given classification store field)

- support `IN()` in data query selectors, e.g. `Product:sku:[123,234]`

- execute Pimcore-based dataports automatically if the initialization function "Execute every x hours" is being used → pseudo cronjob

- export thumbnails in WEBP format if thumbnail format = "Auto (Web optimized)"

- support automatic creation of non-existing select field options for classification store and for multiselect fields

- raw data extraction: do not import empty raw item data fields -> faster raw data extraction (for example CSV with technical data where certain columns only apply to products of a certain product group but are empty for all others)

- automatically delete (temporary) created parent elements which do not have child elements anymore (this happens when import order does not create parent objects first

- serialize dataport's source / target config as JSON, not with serialize() -> better readability / diff view for version files

- queue processor monitor: store status in database instead of file-based (necessary when queue processor runs in different container than Pimcore)

- lots of bugfixes

# 3.4.0

ChatGPT integration
-------------------

It is now possible to infer technical attributes from a text, e.g. use input `Long-sleeved cotton shirt with blue and orange stripes` as input and automatically infer an object brick multiselect attribute `colors` to `blue` and `oraange`.

On the other hand it is possible to generate texts from technical data, e.g. use input

- Name: Cool Casual Shirt

- Material: cotton

- Colors: Blue, Orange

- Gender: Male

and let ChatGPT generate a product description like

> The Cool Casual Shirt is a comfortable and stylish choice for any man. Made from high-quality cotton, it offers breathable comfort that will keep you feeling great all day long. Available in two vibrant colors - blue and orange - this shirt is perfect for casual wear or dressier occasions.
Designed with the male physique in mind, it provides a flattering fit that looks great on every body type. Whether you're heading to work or out with friends, the Cool Casual Shirt has got you covered!

Performance
-----------

### Reduce memory consumption

By removing the timestamp and context from each log message less memory gets used. Also a lot of minor refactorings reduced memory usage, especially import for big imports.

### Faster raw data import

More efficient pagination for fetching raw data items -> instead of LIMIT 100000, 100 try to use "priority > &lt;last processed raw data item&gt; LIMIT 100", see <https://ramzialqrainy.medium.com/faster-pagination-in-mysql-you-are-probably-doing-it-wrong-d9c9202bbfd8>

### Smarter check for executing automatic dataports

Automatic dataports get saved if an object of the configured source data class or a dependent object of such an object got saved. In the past this caused loads of queued processes which actually did not make sense because the raw data fields did not access data of the saved object. Now there is a
smarter check if it is necessary to execute automatic dataports for dependent objects by analyzing data query selector's target classes. The dataport gets only executed for objects whose raw data could potentially be changed through the the saved object.

Pimcore 10.6 compatibility
--------------------------

Version 3.4 is compatible with Pimcore 10.6. We are currently working on Pimcore 11 compatibility.

Web2Print
---------

This version introduces a callback function template to generate PDF asset files from Pimcore documents. This way it is easy to set up an automatic PDF generation pipeline like

1. save data object

2. → generate corresponding document

3. → convert document to PDF asset

4. → automatically assign generated PDF asset to saved data object

:before data query selector
---------------------------

With the "before" data query selector you can access previous version's data. Use case: With the `before` helper you can access data of the previous version of an object, e.g. `before:published` will return if the object was published in the version before the currently published one. This can be
used to trigger actions when certain fields change, for instance you could set up an automatic dataport with condition `o_published=1` and raw data field `before:published`. As soon as someone publishes an object (so that SQL condition `o_published=1` is true) which was not published before (if this
is the case you see in the raw data field with data query selector `before:published`), you can now trigger some action. This enables you to set up workflows (e.g. notify reviewer when certain fields get changed).

Dataport settings
-----------------

- support FTP, SFTP, FTPS for import type "file system" to retrieve files from remote storage as import resource

- support selecting raw data fields for Pimcore-based dataports via Pimcore's grid configuration field selector

- support loading environment variables / website settings as via data query selectors

Attribute mapping
-----------------

- support setting DeepL / OpenAI API keys via website settings and attribute mapping

- apply write-protection (aka "Do not overwrite if already filled") for mapped object brick container / classification store container fields on field level, not in general for whole container -> empty fields get filled while currently populated fields remain the same

- add option to automatically create referenced related objects for many-to-many object relation fields: when `Keyword:name#en:Test` is tried to get assigned to a many-to-many object relation, an object of class "Keyword" with English name "Test" will get created (if it does not already exists)

- support dynamic creation of object bricks and object brick fields (when enabling "automatically create non-existing fields" for object brick container)

- support for deleting elements

- simpler attribute mapping for field collections (before there were a lot of arrays necessary in callback function)

- when import text for wysiwyg fields does not contain any HTML tags, apply nl2br() to keep line breaks

- support accessing [website settings](https://pimcore.com/docs/platform/Pimcore/Tools_and_Features/Website_Settings/ "https://pimcore.com/docs/platform/Pimcore/Tools_and_Features/Website_Settings/") in "{{ }}" placeholders

- support drag & drop to copy one field's mapping to another field

- support importing localized block fields

- support fetching an element's "tags" via data query selector "tags"

- callback function history: add "restore" and "copy" buttons to restore / copy previous version

Other changes
-------------

- dataport configuration: add right-click context menu for dataport tabpanel to close all / close other dataport tabs

- provide "dependency graph" as default object preview

- serializing classification store / object brick container now only returns current language data for localized fields

- bugfix: if raw item field for key field contained an array it was provided as single items to $params['value'] -> $params['value'] should always contain the real raw item data

- when an automatic dataport gets cloned, disable "execute automatically" checkbox

- dataport settings: check for settings conflict (when another user saved in the meantime)

- provide $params['translator'] object to callback functions to access Pimcore translations

- send error notification mails even if neither website domain nor debug email address have been set (in this case send with sender=no-reply@Pimcore)

- attribute mapping panel: copy variable via click, open in new window via double click (same as it was some months ago)

- withoutInheritance now also disables fallback languages (before only disabled parent-child inheritance)

- provide universal path formatter which displays the fields, which are configured to be shown in grid view, also in the relation field (instead of Pimcore's default full path)

- provide data option provider which can be used with a data query selector to define dynamic options -> allows for dynamic select fields and even dependent select fields within the same object

- add "HTML container" layout component -> add pure HTML into object editing panel (which as a side effect also supports data query selector placeholders)

- support "deeplink" data query selector (e.g. for workflows)

- add user information to $params['context']

- support placeholders like {{ date#Y-m-d }} (PHP function with parameters)

- disable intelligent logging when executing user is an admin (otherwise it is difficult to debug automatic imports)

- send HTTP 500 for REST API calls if dataport run got aborted (was 200 before)

- support calling dependent dataport by name

# 3.3.0

Dataport run summary
--------------------

There now is a summary window for manually executed dataport runs. This provides a graphical user interface to what happened during imports and exports. It shows dataport run progress, changed data (inclusing diff view) and errors (if any occurred):

![Summary window](doc/images/summary.png)

This enables non-technical people to run dataports and check if everything worked well.

Intelligent logging
-------------------

For dataport runs which do not get started from Pimcore backend (e.g. cronjob runs, REST API, event-triggered dataport runs) the logger watches for errors (but also buffers less severe errors) - only if an error occurs, the buffered logs get written. When the run finishes successfully without any
errors, warnings, notices, no log file will get saved. This reduces the amount of disk space for the log files and thus makes very frequent applications possible like real world website user facing REST API interfaces.

Moreover, this version implements lazy logging: the logging information gets only generated if the log level will actually be logged (previously the log string was generated before and then the log was logged - but for log levels which do not get logged anyway, all the effort for generating the log
information (e.g. object serialization, JSON-encoding etc.) was useless.

More efficient queue processor
------------------------------

Import runs for same dataport but different import resources now get run in parallel. This makes automatic dataports (e.g. data quality) being executed much faster when doing bulk imports.

Queue processor now more often adjusts the number of parallel processes. Furthermore, the number of max parallel processes get saved in website settings instead of cache to prevent this number being reset when the cache gets cleared. Side effect: it is possible to manually increase number of max
parallel processes.

UI changes
----------

### Dataport tree

- mark dataports which have not been used for more than 14 days to support cleaning up old dataports

- show dataports with errors during last runs in red color to immediately see which dataports currently have problems

- show roles which have a dataport as favorite in dataport tree context menu hierarchically for better overview when there are many roles

- for grouping dataports with common prefix, ignore case of first letter

### Dataport configuration

- support bulk edit for raw data fields

### Attribute mapping

- show better preview / explanation when key field returns an array

- support mapping creationDate, modificationDate for asset imports

- do not show single object brick fields if there are more than 50 -> only support mapping via object brick container, otherwise loading time is too slow (but we have to improve this anyway)

### Preview panel

- support multi-select for processing multiple raw data items (for testing)

- support multi-select for opening multiple objects by referencing key fields

- highlight data where search term is found instead of hiding columns where search term is not found

### Object editing panel / grid panel

- show available exports/imports for object in object editing toolbar

- grid export: always set "Content-Disposition: attachment" because grid exports are always executed in same window as Pimcore - but if the result callback function does not create a result document (but e.g. only queues another dataport), a blank page got opened in the Pimcore tab -> now there is
  always a download for grid exports - if the dataport does not generate a response document, a dummy one with "Dataport successfully executed" gets provided

Other changes
-------------

- XML imports: log XML errors (previously raw data was just empty but nobody knew why)

- sometimes Cli::exec() blocked the Apache request

- support importing from FTPS resources

- prevent misuse of programmatically started dataports: when dataports get started programatically, it could happen that too many processes were executed and the server went down. Now it is checked if for given dataport there are already many processes running (relative to CPU count) and if too
  much, new processes get added to queue automatically instead of being executed

  This can for example happen if another dataport gets triggered from result callback function via Cli::execInBackground('bin/console dd:complete 123') - actually the "start dependent dataport" template does prevent this but if the developer does not use this template, he could step into this trap -
  but not anymore ;-)

- support importing to field type "block"

- support importing strings which look like JSON but shall be treated without parsing, e.g. [100.00] must not be converted to [100]

- automatically install migrations in maintenance job -> prevent all the hassle with Data Director being updated but not appearing in Pimcore backend

- automatically delete queued items which are older than 3 days -> most of the time this comes from wrong result callback functions with "start dependent dataport"

- data query selectors: support finding assets by metadata fields

- enhance recognition of quantity value field's value and unit when provided as string. Following strings have been successfully tested to be imported to quantity value fields:

    - 1,23m

    - 1.23m

    - 1.23 m

    - -10°C

    - 10°C

    - 10 °C

    - 12 turns per minute

    - € 12

- when there were queued processes which refer to dataport resource ids which got deleted in the meantime (e.g. by deleting raw data in preview panel), the corresponding SQL conditions got created as standalone dataport resources -> this could lead to very much dataport resources for those automatic
  dataports -> all of them had to be checked when an object got saved -> slow saving

- prevent bogus "Queue processor could not be started" email notification

- use league/flysystem-sftp-v3 instead of league/flysystem-sftp → PHP 8.1 compatibility

- asset imports: prevent errors when importing folders

- support special raw data field selector "__count" to get number of records in current import file

- tag elements with import errors to easier search for import problems

- support "__all" raw item data selector for XML resources to get complete raw data item in one raw data field

- provide currency converter service when Quantity Value fields get imported with "auto-create non-existing units"

- support automatically executing dataports without import resource (e.g. as pseudo-cronjobs)

- add callback function template for initialization function to limit frequency of dataport, e.g. execute every x hours only (pseudo-cronjob)

- support CORS preflight request for REST API endpoints

# 3.2.0

Object wizard
-------------

With the object wizard you can create custom forms in Pimcore admin area. This can be used to set up mass-editing workflows, create objects with mandatory fields and default values (e.g. generate SKU automatically) or start conditional exports. Together with the favourite dataports feature the
dataports can be accessed from Pimcore's main menu and so support frequent data maintenance use-cases. It is now also supported to set favourite dataports for roles so that for those frequent use-cases the favourite (= main menu) dataports do not have to be configured for each user individually.

Object preview / object dependency graph
----------------------------------------

Pimcore supports a [preview tab](https://pimcore.com/docs/pimcore/current/Development_Documentation/Objects/Object_Classes/Class_Settings/Preview.html "https://pimcore.com/docs/pimcore/current/Development_Documentation/Objects/Object_Classes/Class_Settings/Preview.html") in the object editing panel.
This feature can be combined with a Data Director export. The export can create an HTML document which can be shown in the preview panel of the currently opened object.

Two preview templates get shipped currently:

1. All data fields preview\
   shows the current object's data as known from the [versions panel](https://pimcore.com/docs/pimcore/current/Development_Documentation/Tools_and_Features/Versioning.html "https://pimcore.com/docs/pimcore/current/Development_Documentation/Tools_and_Features/Versioning.html")

2. Dependency graph\
   Show dependency graph for current object and its relations (it is configurable which relational fields are taken into account) e.g.

![Object dependency graph](doc/images/object-dependency-graph.png)

Dynamic raw data field selector
-------------------------------

There now is the "__all" selector to retrieve all raw data fields for current import item, e.g. to implement dynamic imports. This way you can set up imports for documents with different structure, e.g. once there is a CSV with SKU and name, next time the import CSV has columns SKU and price. In
this case the `__all` raw data field will contain all raw data `{SKU: 123, price: 3.99}` and can be processed in the attribute mapping callback functions.

UI changes
----------

- Data Director will now appear at first level in main menu so that executing favourite dataports will become easy

- attribute mapping: more efficient loading of `$params['currentValue']` do not load individual classification store fields if there are more than 50 fields possible -> in 99% of cases values will be mapped via the classification store container anyway

- set `overwrite: true` for image galleries, many-to-many-relations etc. by default to prevent masses of duplicate images with _1, _2 etc. being created

- fix buggy dropdown fields (when clicking expand button, option list is shortly expanded but directly closes again)

Other changes
-------------

- for automatic Pimcore-based dataports: support accessing data from just saved object in dataport condition, e.g. o_id='{{ id }}' -> this will run the dataport only for the just saved object and not for dependent / parent objects

- remove edit-lock check / notification for real users because only "dirty" fields get transfered for saving in Pimcore backend -> when really a certain field gets updated by an import and a real user, the real user will win anyway (because he will save later) only in case, when 2 imports update the
  same object in parallel, the edit lock exception will appear

- when using --rm option together with __source raw item field, from now the import file gets copied to a temporary file (before the file in __source did not exist anymore after raw data import)

- "truncate before import" option now only truncates relations image galleries etc. on first raw data item whose key fields' match a certain element. When the same object gets referenced by multiple raw items' key field(s), the given field will not get reset again

- history panel: display asset path for linked archive file when archive folder is a Pimcore asset folder (before filesystem folder was shown)

- queue processor: limit max parallel processes to 4 * CPU count (because some processes might be waiting for external APIs). Only increase number of max parallel processes if current CPU load (for 1 CPU) is < 1

- support exporting documents (incl. auto-generate raw data fields)

- disable timeout / SSL certificate check for URL-based imports

- support pipe-separated values in callback function template for m2m relation

- CSV: support importing files with Byte-order mark (BOM)

- performance enhancement: resolving object IDs of dependent elements for automatic dataports needed very long because of multiple conditions like "o_path LIKE /abc/%' OR o_path LIKE '/def/%'"

- support getting thumbnail image of document assets (e.g. PDFs) with ":thumbnail" data query selector (problem is that for documents the Pimcore method is named "getImageThumbnail()" in contrast to getThumbnail() for images - this made it especially difficult for many-to-many-relation fields to get
  all assets incl. thumbnails via "relation:each:(thumbnail:url)" - but now this is possible)

- asset import from URLs: use actual filename from URL -> strip query + fragment part of URL

- support exporting and importing video field type

- do not abort dataport runs which are in the "lastCall" step because this will naturally need longer than all the previous data because in a lot of cases the export file is created in this step while in previous steps the data is only prepared

- support importing documents to (advanced) many-to-many relations

- BC break: data query selectors of multiselect fields return array (previously semikolon-separated string)

- do not remove history logs which have 0 items but have errors (previously all history items with 0 done items have been deleted after 5 minutes)

- auto-create raw data fields for Pimcore-based dataports will create easier-looking data query selectors, especially for relations with very much fields - the Serializer will create sane values anyway

- attribute mapping: when importing an export with localized fields like name#all (which returns ['de' => 'german name', 'en' => 'english name']), assigning this complete array to name#de will automatically use the "de" value

- support assigning images to image editables when importing documents

# 3.1.0

Data Query Selector Grid Operator
---------------------------------

With Pimcore's default grid operators it sometimes is difficult to extract the desired data. To make this easier there now is a data query selector grid operator to extract data from the shown objects, its relations or even completely different objects. This also supports the auto-suggest feature
which you might already know from implementing data query selectors in export raw data fields.

Moreover there now also is a new field type "Calculated Value (Data Query Selector)" to define logic at field definition level (similar to Symfony expression language but with Twig syntax and Data Query Selectors you have much more options). This way you can define calculated value fields' logic
directly in field definition.

Performance Improvements
------------------------

Raw data extraction and raw data processing now use bulk inserts instead of previously saving raw data / data objects one after another. This brings about 600% performance improvement for raw data extraction!

Another performance improvement is that virtual fields of result callback function now only get processed once - so far this has been done for each raw data item again and again.

Enhanced ad-hoc grid exports
----------------------------

Data Director now offers out-of-the-box CSV, XML and JSON exports of data which is shown in the currently shown grid - including custom table configuration and operators. All the processing is done server-side which reduces export time compared to Pimcore's default CSV / Excel exports.

Versioning of Dataport settings
-------------------------------

All changes of dataport settings are now versioned. With this you can compare and revert changes up to 90 days.

Minor Features
--------------

### Queue Processing

- execute imports with "automatically execute on new data" checkbox which cannot get detected by events (like file system imports), together with maintenance job

- Queue Processing: remember number of allowed parallel processes for each dataport for queue processing (so that it does not start at the same numbers initially)

- keep scrolling position in queue monitor

### Debugging / Logging

- show outputs during dataport run also in preview window (not only in log) -> easier debugging

- support logging complex values with $params['logger'] in callback functions -> no need to convert it to a string first

- log parsed values of callback functions, not only raw return values, e.g. when a callback function returns a data query selector

### Imports / Exports

- with "Enable inheritance" checkbox being disabled for pimcore-based dataports, also SQL condition now goes to non-inherited data tables

- save DeepL (or other translation provider) results to shared translations to not having to pay them again after clearing the Pimcore cache (formerly they were saved to Pimcore cache - if this was deleted the translation for the same input had to be paid again)

- return null when data query selector cannot find object (previously it returned false or even the data query selector string itself)

- prevent sending error-log email when another error-log email for current dataport has been sent within 5 minutes

- support field#locale to import data to classification store fields by mapping callback function for classification store / object brick container

- support multiple classification store groups

- support getting data from block items, e.g. Block:each:(name) or Block:each:(relation:name)

- add byte-order mark to CSV export template -> without this Excel cannot display special characters correctly

- new import source type 'Fixed Length File'

- Dataport::isQueued() now returns false if all the queued jobs for given dataport are already being processed

### User interface

- UX improvement: dataport panel: support auto-creating raw data fields by uploading example import file (no need to set the example file as import resource anymore)

- attrbute mapping: add warning when $params['value'] gets accessed in callback function but no raw data field has been assigned

- history panel:

    - do not show started but still queued jobs in -> caused irritation that 2 processes existed (1 running and 1 queued) but this is actually the queued job which is running

    - support to filter by "done" and "total" items which were processed in the dataport run, e.g.

        - done > 0

        - done > 1000

        - total > 1000

        - done < total

        - done = total

    - do not delete logs / history when clearing raw data or when dataport resources get deleted -> e.g. to know when a dataport was last executed

- preview panel:

    - when processing single raw item in preview panel, make logs window maximizable

    - better performance for search

### Others

- replace symfony firewall for REST API with custom token validation -> easier installation without having to change the global security.yaml

- change plugin_pim_rawitemField.priority to SMALLINT to keep raw item field order correct when having more than 127 raw data fields in one dataport

- add Composer script to automatically execute bundle migrations

- cleanly implement asynchronous dataport runs (side effect: bypass problems with non-overridable max_execution_time or proxy timeouts)

- reduce waiting time for import files in a folder / glob expression to 2 seconds (was 10 before) -> this is the timespan which a file must not have been modified for being used in an import to not import files which are just being uploaded

- show favorite dataport as sub menu items of main menu item "Data Director" when user is not allowed to see main menu "settings"

# 3.0.0

Huge performance improvements
-----------------------------

### New saving method

Pimcore's default saving method is not optimal concerning performance as it does not only save the changed things but recalculates every aspect for all class fields: e.g. it checks all fields for validity, recalculates dependencies etc. So even if you only change a single input field, all those
processing steps get done.\
For this reason the Data Director 3 brings its own saving mechanism which only saves what really has changed. This brings about 200% performance improvement.

But as this is a big change after upgrading to version 3.0 all existing dataports are set to use a so called "compatibility mode". This means they will continue to use the old saving mechanism first to reduce the risk of many non-working dataports. You can disable "compatibility mode" in the
dataports advanced settings. New dataports automatically have "compatibility mode" off., allowing for optimal performance.

### More efficient loading of latest version data

So far to check if an object got changed during the import the latest object version got loaded but as versions are stored serialized on the filesystem, this operation is quite expensive. In version 3 we fetch the old values of the mapped import fields before changing them - thus there is no need to
load the version anymore.

Parametrize behaviour
---------------------

You can now parametrize all elements of a dataport:

- access URL / CLI parameters in data query selectors of Pimcore-based dataports, e.g. image:thumbnail#{{ format }} will return the thumbnail path of the thumbnail definition "500px" when the dataport gets called via /api/export/dataport-name?format=500px

- access URL / CLI parameters in callback functions via {{ param_name }}.

- access URL / CLI parameters in import resource / SQL condition (exists since version 2.6)

It now is also possible to access fields of the source data class in data query selectors oh Pimcore-based dataports. E.g. when you have the data query selector myMethod#{{ sku }} automatically the SKU of the current source class object will get used (as long as no URL parameter "sku" overrides
this). Or alternatively you can can call service classes this way: @service_name::method#{{ id }} will call the methid "method" of a symfony service "service_name" with the id of the current source class object.

### Import to calculated value fields

It is now possible to import data to calculated value fields without having to create a calculator PHP class. This can be used for all data which is only supposed to be used for displaying but not for editing, e.g.
for [data quality visualization](https://www.youtube.com/watch?v=M1VVmpTjB_I&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=8&t=68s "https://www.youtube.com/watch?v=M1VVmpTjB_I&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=8&t=68s").

Show raw data in Pimcore report
-------------------------------

There now is a report adapter for dataport raw data. This has 2 main use-cases:

1. makes raw data reusable between multiple dataports

2. simplifies creating reports because no SQL / Pimcore database knowledge necessary

Prevent duplicate assets
------------------------

With a single checkbox it is ow possible to create assets only if they do not exist yet. This even works if asset images have different sizes.

UI changes
----------

### Dataport settings

- enhance auto-complete for data query selectors

- sort suggested data query selectors by levenshtein distance to requested data query selector -> more relevant sorting

- when creating dataport, analyze dataport name to set dataport source type + source / target class

### Attribute mapping

- show language of localized fields as flag to better recognize language

- show dependency visualization when clicking on an attribute mapping field

- accelerate callback function template generation

- update dependent fields when updating callback function

- make callback function window maximizable

### History panel

- support searching for dataport run log file name to easier be able to access import archive file

- format start date according to current user's locale (which gets derived from the user's language)

- do not open new window when result callback function does not generate any output (e.g. for imports which call a dependent import)

Raw data extraction Data query selectors
----------------------------------------

- trigger warning if CSV / Excel file contains same column heading multiple times

- support ":url" data query selector for assets and image fields to get the absolute URL of assigned asset(s)

- support finding reverse-related objects via `Category:products:.` when the Category class manages the relation to products and export's source data class is Product

- support "ancestors" / "descendants" in data query selectors to get all objects above / below current object

- support filtering arrays in data query selectors, e.g. For example a many-to-many relation `categories` can be filtered with `categories:filter#published,true` to only get the published related category objects.

  Another use case is when you have a field collection of prices and their validity dates, you can use `prices:filter#validFrom,now,>=:filter#validTo,now,<=` to get all field collection items which are valid today

- support "withInheritance" / "withoutInheritance" helpers to enable / disable inheritance for single data query selectors

- support suffix aliases in data query selectors, e.g. (scalar;object:scalar) as group1

Raw data processing
-------------------

- provide $params['transfer'] also for field callback functions

- support finding relational objects via unique index -> no need to return a data query selector "Manufacturer:name:".$params['value'] when the field "name" is unique in the class Manufacturer, just assigning the manufacturer name raw data field would suffice

- support finding multiple objects via data query selectors

- stream-write result documents to keep memory consumption low even when generating large export documents (currently only implemented for CSV)

- bugfix: object key was not valid when key was 255 characters long and an object with same key already existed -> we need to substract suffix length to get to 255 characters again

- add option to automatically create classification store fields

- support automatic text generation via OpenAI API

- support language mapping to translation provider (e.g. to use en-gb as target language for "en")

- when restarting dataport runs because of unintentional abortion, check if dataport is continuable: Non-incremental exports cannot be continued and have to be rerun completely. Imports and incremental exports can be continued (as before)

- support assigning elements to asset metadata (so far only type "input" was supported)

- bugfix: process virtual fields which are used in key fields

Other changes
-------------

- delete raw data in chunks -> otherwise it takes ages to delete 1 million raw data items

- refactor logging to not waste memory

- remove spatie/once -> lots of unnecessary debug_backtrace() calls

- group application logger logs (log certain message only once and add "happened 3x")

- find unpublished objects with data query selectors for fields which do not have a getByXyz() method

- data query selector Product:articleNo:.:name#de to get the current value of field "articleNo" is not supported anymore. This data query selector shall find products with articleNo=. And you can use $params['currentObjectData']['articleNo'] anyway to get the current value

- automatically fix wrongly configured default timezones between webserver PHP and CLI PHP by always saving dates in UTC -> otherwise strange effects can happen: dataport runs get aborted because they take too long, negative runtimes shown in history panel etc.

- notification mail informing about queue processor which could not be started was also sent if queue processor got started but finished in less than 5 seconds

- auto-reload elements if they got changed by automatic imports after saving

- skip hash check for pimcore-based imports Use case: Automatic import which sets published based on certain logic of raw data fields. 1st run: published gets set to false -> hash of raw data gets remembered -> object gets saved & published again without changes 2nd run: raw data is the same -> but
  published got changed -> we have to execute dataport again, otherwise object is published although published logic would unpublish it

- support different request contexts to be able to change behaviour of overridden getter methods

- when renaming dataports, point all redirects for old REST API endpoint URLs of this dataport to new URL -> prevent redirect chains

- bugfix: do not trigger edit-lock message when current user just saved the object

- result document action "send as mail": support sending response document as attachment

- automatic start did not work for Excel imports

- delete temporary files after each batch of processed raw data items -> by default they are deleted when process finishes but this wastes a lot of disk space

- bugfix: cleaning up application logger log files did not work correctly

- log user who started dataport run

- remove behaviour that manually uploaded files should use "default" dataport resource - instead create separate resource for uploaded file but also recognize same file name -> when a dataport is run with the same file, overwrite previous file and also show filename in history panel instead of
  generated uniqid()

- do not process multiple raw data items in one db transaction -> when there is a problem with one item, all the other can also not be imported

# 2.8.0

Restart failed imports
----------------------

Whenever raw data processing gets aborted unintenionally (e.g. process killed by operating system or process started via CLI and user logged out from SSH), the import will be queued to be continued from the raw data item where it got aborted.

Initialization function
-----------------------

In attribute mapping you can now implement an initialization function which gets executed before raw data processing starts. This can for example be used to reset fields of the dataport's target class which will get repopulated by the import.

As a template function it is also provided to abort the dataport run if another process of the current dataport is running.

Improvements: Raw data extraction
---------------------------------

- support UTF-8 4-byte characters in raw data

- support <ftp://user:password@hostname> and sftp://user:password@hostname as import resource

- add checkbox if inheritance shall be used for Pimcore-based dataports

- data query selector: try to access public property when there is a method but it is not accessible -> e.g. Carbon::timestamp

- add multiSelect:has#option as data query selector for multi-select fields

Improvements: Raw data processing
---------------------------------

- support specifying character encoding for CSV exports

- bugfix: do not delete existing tags

- queue processor: run exports for same dataport but different dataport resources in parallel

- bugfix Pimcore 10: creating asset from remote stream did not work

- bugfix: importing properties did not work

- resolve ids for dependent / descendent objects of saved object for queueing automatic Pimcore-based dataports in save event listener -> prevents queueing o_path LIKE '/abc/' OR-conditions -> shorter commands and better performance for the queued raw data extraction

- bugfix: creating empty parent objects when a data query selector for field "path" gets returned which does not return an object did not work when the data query selector filter value contained only digits

Improvement: Others
-------------------

- for worst error tooltip in history panel, do not show stack trace -> otherwise the link to the log file is hard to click

- set default cleanup interval to 14 days -> before was 30 but does not make sense for application_logs because this gets archived every month

# 2.7.0

New field types: Text generation / Calculated values
----------------------------------------------------

There are 3 new field types available in Pimcore's class definition view:

- Input with variables

- Textarea with variables

- Wysiwyg with variables

Those fields are a combination of normal text fields and calculated value fields. With those you can write the calculation logic directly in Pimcore backend and have a live preview directly beside the input field.

It supports data query selectors to access data of other fields and other objects, e.g.

`This {{ category:name }} is {{ color }}.`

will get resolved to `This t-shirt is black` if there is a many-to-one relation for the product's category which has a field `name` and if the product has an attribute `color`.

You can also implement any logic operations with [Twig syntax](https://twig.symfony.com/doc/3.x/templates.html "https://twig.symfony.com/doc/3.x/templates.html") with the exception that the variables are defined with data query selectors, e.g.

```twig
{% if category:name#en == "T-shirts" %}
  This shirt is made of {{ materials:each(name):implode( and , %s) }}.
  
  Properties:
  <ul>
  {% for attributeName, attributeValue in attributes:tshirts %}
    <li>{{ attributeName}}: {{ attributeValue }}</li>
  {% endfor %}
  </ul>
{% endif %}
```

If the assigned category's name is "T-shirts" and there is an object brick container which the object brick `tshirts` got assigned, the result will be:

```html
This shirt is made of cotton and polyester.

Properties:
<ul>
    <li>Color: black</li>
    <li>Size: XL</li>
</ul>
```

This allows to define the template for the texts at a high level and then inheriting it down for all descendant products. Thus you have automatic text generation dependent from your template which gets defined directly in Pimcore backend.

This also allows for rapid prototying of applications: For example if you develop a product detail page and know where the product price shall appear, you can create a field `price` and access it in your template. Later on you can either fill this field and / or also refer to other fields of the
data object or other objects. The advantage of this compared to
a [calculated value field](https://pimcore.com/docs/pimcore/current/Development_Documentation/Objects/Object_Classes/Data_Types/Calculated_Value_Type.html "https://pimcore.com/docs/pimcore/current/Development_Documentation/Objects/Object_Classes/Data_Types/Calculated_Value_Type.html") is that you
can implement the logic directly in the data objects and also inherit / override the logic for a certain group of data objects without having to create loads of if conditions in a calculated value calculator.

This way you could for example change the calculation of prices without changing the controllers or frontend templates. This makes you independent of the existence or naming of fields which may be used for price calculation, like date validation range, customer-specific pricing etc.

Transaction bundling
--------------------

For better performance multiple items are processed in one database transaction. To not overload the system and to reduce the probability of deadlocks a slow start algorithm is used. Only if no deadlocks or long lock wait times occur, the number of items processed in one transaction gets increased.
In case of a deadlock transaction is automatically rolled back and retried.\
This brings up to 100% performance improvement for raw data extraction, 40% for raw data processing.

Running dataports
-----------------

- support --parameters for CLI commands (to change import source dynamically or to provide parameters which are used in attribute mapping)

- support calling dataports by name, e.g. bin/console dd:process "My dataport name" → portable calls in your scripts when dataports have different IDs on different systems

Data extraction
---------------

- enable inheritance for Pimcore-based dataports only for exports. For imports inheritance gets disabled - e.g. to not get inherited values when setting up a translation import

- add #all helper to get a field's values in all configured languages, e.g. `name#all` will return `['de' => 'Fahrrad', 'en' => 'Bike']`

- support for data query selectors which return multiple items, e.g. `Product:key:a*:all:key` will return an array with the object keys of all product objects whose object key begins with "a"

- support extracting data from namespaced XML tags like `<g:id>`

- support accessing reverse object relation field via data query selector

- support serialising hotspots + markers of Image advanced and image gallery fields

- extract boolean values as 1/0 instead of 1/""

Data processing
---------------

- skip item if at least one key field is null (previously all key fields had to be null to skip an item)

- support explicit target definition of field collection class in attribute mapping → important when multiple field collection classes have the same fields, then it is difficult for the automatic field collection type detection to use correct field collection type. Now it works the same as for
  object bricks

- allow to automatically create options for select / multiselect fields

- do not import (input) quantity values with only unit but no value like "A", " A"

- add callback function template to generate URL slugs incl. duplicate prevention

- support synchronous call in callback function template "start dependent dataport" → e.g. to request other dataport to create a missing related object and then continue with import

- support mapping multiselect options by option key (=label)

- bugfix grid export: column heading "id" appeared in the data

- provide `$params['logger']` to all callback function calls for better debugging options

- provide language of localized fields as `$params['locale']` to callback functions

Performance
-----------

- mark fields as non-dirty when isModified does not recognize a change -> speeds up saving

- shuffle batches in queue processing to prevent lockdown because of always the same jobs being started at first

- queue processor: slow start algorithm to not block $maxParallelProcesses with 4 slow incremental export processes

- raw data processing: only fetch data object's current value if necessary

- when using `$params['currentObjectData']['someField']` in a callback function, only serialize the value of field "someField", not the whole object

UI
--

- Full-featured code editor for creating callback functions in attribute mapping incl. syntax highlighting and autocomplete

- improve preview panel raw item search

- Remember open dataports on backend reload -> reopen dataports when backend gets reloaded

- Favorite dataports\
  With a right-click in the dataport tree you can mark a dataport as favourite. Your favourite dataports are listed as submenu entries under the Data Director menu item in the Pimcore backend. This way they are quick to access.\
  Favourite dataports are user-specific.

- Import resource field now grows automatically, automatically wraps long lines (useful for example for curl requests or when data query selector placeholders are used and thus the string gets long)

- raw items fields panel:

    - add option to copy raw item field

    - add option to move clicked field after currently selected field

# 2.6.0

Dynamic import resource
-----------------------

You can use placeholder variables in the import resource path / URL, e.g.:

- `http://example.org/api/fetch-product-data?sku={{ sku }}`

    - The goal is to exchange the parameter `sku` by the SKU of the just saved product. This is useful for automatic imports: The variable `$sku` refers to the field `sku` of the dataport's configured target class. The variable in the import resource URL gets resolved when an object of this target
      class gets saved and with this resolved URL a dataport run gets queued for import.\
      You can also use the notation `http://example.org/api/fetch-product-data?sku=$sku`

- `http://example.org/api/fetch-product-data?username={{ ApiConfiguration:path:/example-org-api:username }}&password={{ ApiConfiguration:path:/example-org-api:password }}`

    - In this case the goal is to store API credentials in a separate `ApiConfiguration` object (class `ApiConfiguration` is a data object class in this case). All features of data query selectors can be used here. This way the API credentials can be maintained in a separate object and not directly
      in the dataport's import resource configuration.

This feature can be used with all types of import resources, like URLs, files, folder names, cURL requests, PHP scripts etc.

Dynamic attribute mapping for fields for object bricks / classification stores
------------------------------------------------------------------------------

You can directly map your data to the object brick / classification store container field by returning an associative array whose keys are the brick / classification store group names:

```php
return [ 
    'brickName' => [
        'field1' => $params['rawItemData']['field_1']['value'],
        'field2' => $params['rawItemData']['field_2']['value'],
    ]
];
```

This way you do not need to map each field individually and the mapping gets automatically adjusted of new fields get added in the import resource.

Optimization
------------

It is now possible to automatically minimize / maximize the value of a calculated value field by changing the values of other mapped fields. With this feature you can for example solve logistic problems where you want to know the shortest route to visit n places (Traveling Salesman problem). In this
case the length of the route would be calculated in a calculated value field while the places to be visited (e.g. many-to-many object relation) would get reordered until an optimal solution is found.

But of course this feature is applicable to a wide range of use-cases, whereever you want to optimize a value based on other values: e.g. time budget optimization (order units of work in a way to get maximum revenue), portfolio optimization in stock market, stock production optimization (reduce
storage costs and nevertheless try to fulfill customer's demand) etc.

Other new features
------------------

- Automatic translation: Support partial translation with shared translations

    - Exclude terms from being translated

    - Support custom translation for some terms via shared translations (before automatic translation gets executed)

- Better dataport monitoring

    - Log PHP errors / warnings during dataport runs incl. grouping of similar errors

    - Send notification email to users which are allowed to change a dataports' configuration when there is an error during dataport execution

- Support accessing relational fields in SQL condition of Pimcore-based dataports, e.g. for a dataport with source data class "Product" which has a relational field "categories" to class "Category" which has a field "name" you can have SQL condition: categories.name LIKE 'a%' and will only get those
  products which have at least one category assigned whose name begins with "a" → no need to implement the JOIN yourself

- Support import and export of classification store

- Support for importing field type "Geographic Point"

    - support different formats of geo coordinates

    - support geocoding addresses

- pass request to result callback function + result document action to be able to change logic based on request (URL) parameters

- all library versions are compatible with PHP 8

- save hash of current rawdata in object properties for incremental exports to prevent re-export if dataport's raw data did not change

- recursively replace data query selector placeholders in text data, e.g. when the field for SEO title contains {{ name }} (referring to the name field) and the field for SEO description contains "A {{ seoTitle }} is very nice", then the data query selectors within these fields get resolved
  recursively.

UI improvements
---------------

### Dataport configuration Panel

- render demo data in raw data field config with line breaks - prevent horizontal scrolling

- reorder configuration fields for better UX

- strike-through fields which are not used in attribute mapping

### Attribute Mapping Panel

- accelerate attribute mapping load time

- add icons in attribute mapping to see at first sight which additional import settings have been set (write-protected, overwrite images etc.)

- dropdown field to select alternative raw item to be shown in preview (to test special cases before running imports)

- add checkbox to only show mapped fields

- show field type icon before field name, remove field type column -> much more space / less clutter

- show "unexpected output" as tooltip in attribute mapping (e.g. when callback function outputs something)

- only reload attribute mapping panel when a change to dataport settings has been done, otherwise everything should stay the same -> no reload necessary

- support searching for all fields in raw data field dropdown (not only for field name)

- show example data in raw data field dropdown

- do not translate virtual field names as this leads to confusion -> virtual fields are more like variables and must not be translated

### History & Run Panel

- add filter for log type (successful / with errors / queued / running)

- show exacter status description in status column (e.g. if warnings happened, it was "successful" previously)

- add button to monitor / manually start queue processing when there are queued jobs

- show error message on mouseover in history panel (if an error occured during dataport run)

- add dropdown to select language to be used for grid exports / manual exports

- bugfix: redoing pimcore-based dataport runs did not respect sql condition

- option to cancel single queued dataport runs

- save dataport runs' worst error in database -> no need to read through ALL run logs when loading history panel → much faster

- use trigger date in history panel for queued jobs instead of current date

### Preview Panel

- lock raw data key field for exports in preview panel

- support "open object referenced by key fields" from preview panel for exports

- bigger window with logs for single raw item import

- pretty-print and line-wrap values in preview panel (takes less space and is better readable)

Performance
-----------

- cache raw data per object in Pimcore cache (e.g. redis) -> makes raw data import super-fast if dataport for this object already got extracted before

- cache prepared statements

- accelerate grid exports (only export id of elements to be exported - all the other fields are not used anyway only dataport's fields get used)

- 50 % performance increasement for imports

    - not necessary to apply preUpdate event listeners to a clone of the imported object for modification check

    - less memory consumption during raw data processing

- no need to execute raw data processing for deleted objects which were not present in dataport's raw data before

Grid Exports
------------

- support grid exports with lots of elements (which would exceed max length of o_id IN(...) condition)

- load available grid export dataports asynchronically

- UI improvements

- bugfix: grid export in "children grid" of objects created very long URL

Minor improvements
------------------

- delete old file object log files when deleting old DD application logs

- Pimcore 10 compatibility for result callback function templates

- for datatypes which implement PHP's Iterator interface like field collections or image galleries, the "all" selector supports directly accessing the items, e.g. imageGallery:items:all(id) is the same as imageGallery:all(id)

- show dataport name in edit-lock notification (before was only dataport id)

- clearer exception message when no source data class has been selected for Pimcore-based dataports

- write remote import resources to temporary file to be able to reuse it for dependent dataports

- bugfix: when key field returns array in attribute mapping, preview and variables were wrong

- rename field "Key" to "Object Name" in Attribute mapping to prevent confusion with key fields which are used for retrieving existing objects

- overwrite images with 0 byte filesize / non-existing filesystem file even if "overwrite" is not set

- do not process queue when maintenance mode is active

- bypass Pimcore 6.9 core bug: import assets from URLs / remote streams

- catch wrongly ordered firewall configuration and give hint how to solve the problem

- support extracting image gallery, quantity value and other fields which implement OwnerAwareInterface directly without specifying which fields of such complex datatypes to export

- do not return dummy objects in $params['objectIDs'] for raw data items which got actually skipped

- support import to field types which extend Pimcore's core field types

- "delete raw data" now also deletes queued jobs for this dataport

- for advanced relations set all meta fields to ElementMetadata / ObjectMetadata objects, not only those which are provided by import -> solves problem with advanced object search bundle which tries to index all meta fields from the field definition

- support importing to select / multiselect fields with option provider class

- process manager bundle integration: use process bundle manager job logger only if loggers are configured -> if no loggers are configured, use default data director logger

- bugfix: virtual fields in result document action could not be concatenated anymore

- add special field "__index" to keep order of items exactly as in the import resource (no reordering of raw items by raw data fields)

- do not care for trailing empty rows / columns in excel files

- create dataport configuration JSON file if it shall be exported / downloaded but the JSON file does not exist (for whatever reason)

- automatically convert RTF to HTML for wysiwyg fields

- log results of virtual fields for exports

- bugfix: isModified for object bricks did not work for non-localized fields

- use correct path when restarting queue processor if meanwhile a deployment re-linked the pimcore root folder

- accelerate dd:delete-rawdata: do not calculate hash for all languages if dataport resource id with a specified locale is given

- immediately abort dataport runs when ctrl+c is pressed on CLI

- Pimcore versions <= 6.5 return closed stream for Asset::getStream() -> prevent this problem by reopening a new stream

- increase automatic abortion threshold to 1 hour because meanwhile we have a solution for manual abortions (ctrl + c) -> only edge cases will still need the automatic abortion

- bugfix: importing to already existing bricks did not work

- bugfix: trigger garbage collection after 250 items for Pimcore-based dataports (was 1000 before -> caused memory problems)

- show progress bars for queue processing command

- support auto-generation of raw data fields for data object class fields which return array of scalar values, e.g. multiselect which returns an array of strings

- bugfix: automatic decoding of complex raw data was not done for $params['rawItemData']

- bugfix attribute mapping: accessing values of other mapped localized fields did not work, e.g. {{ name#en }}

- log action which triggered dataport job queueing

- support accessing JSON root with selector beginning with "/", e.g. for the structure { metaField: "value", items: [ ... ] } → then you can have item selector "items" and access the metaField with "/metaField"

- catch errors when executing user defined PHP functions via data query selectors

- remove non-printable characters from import resource

- dataport config panel: do not throw error when double-clicking in import resource field and asset is not found (happened whenever import resource is not a Pimcore asset)

- add config if queue processing shall be started automatically

- maintenance job: if queue processing is not running, try to start (if shall be started automatically) - only if this does not work, send mail to admins

- remove temporary grid export dataport resources (tables with prefix "data_director_grid_export_") after 1 day

- result callback function template for exporting CSV with assets as zip could not handle image galleries and many-to-many relations

- result callback function template for exporting CSV with assets as zip could not handle image galleries and many-to-many relations

- result callback function templates: close and open zip archive every 100 files to prevent error of too many files being open

# 2.5.0

Pimcore 10 compatibility
------------------------

This version is fully compatible with Pimcore 10 - with the little exception that not all used libraries are already compatible with Pimcore 8. For Pimcore 10 currently you have to install the Data Director with composer update blackbit/data-director --with-dependencies --ignore-platform-reqs. But
we are working on PHP 8 compatibility also for used libraries...

Grid-filtered exports
---------------------

It is now possible to use the grid view (folder view) to filter and afterwards export the filtered / selected objects. This way you can do ad-hoc filtered exports without having to enter an SQL condition. To start export there is a new option "Data Director export" in the dropdown menu of the "CSV
export" button. In the following modal window you can select the dataport to be used for exporting (only compatible exports for selected grid data object class are shown).

Refactor (automatic) exports for API usage
------------------------------------------

Previously raw data for automatic exports got updated for every previously executed SQL condition. This led to poor performance when saving objects. This has been completely refactored: Now for automatic exports raw data gets only updated for the configured dataport SQL condition (and for every
language). The updated raw data is then copied to previously executed custom SQL condition raw items (so that the export data is already prepared when an export with this SQL condition gets executed again). This way the raw data has to be only extracted once (for every language) and not for all
custom SQL conditions again and again.

Also for API usage important: SQL condition from query parameter of REST API calls for Pimcore-based dataports now extend the SQL condition in the dataport settings instead of overwrite it (to not be able to fetch unpublished objects for example).

Restrict elements for Pimcore-based dataports to those which the requesting user has "view" permission for.

For incremental exports the modification timestamp from last successful export is remembered (write to object property, in analogy to imports). When export is triggered again for this object, its current modification timestamp (incl. potentially inherited fields) gets compared to this property, and
if current modification timestamp is not newer, then object's rawdata does not get extracted -> thus will not be exported. -> this also allows to execute automatic incremental export for all potentially changed objects at once (was previously split to n processes of single-object exports)

Performance
-----------

- queued items of automatic dataports now get processed automatically in parallel → this also ensures that a dataport with only few queued items does not have to wait for other dataports' queued items to be processed

- reuse raw data when there already is a raw data item with current hash which has same modification date as current object

- when using relational fields as key fields for imports, try to resolve related object ids beforehand to prevent a query like "WHERE relationalField LIKE '%,123,%'" - instead a query like "o_id IN (345,13,58)" will get executed which is much faster

- replace conditions in SQL condition of Pimcore-based dataports with relational fields like "WHERE relationalField LIKE '%,123,%'" to "WHERE o_id IN (SELECT src_id FROM object_relations_* ...)" -> can use index -> faster

- raw data extraction: use INSERT INTO ... ON DUPLICATE KEY UPDATE instead of REPLACE INTO

- remove unnecessary locks in Pimcore parser

- data query selectors got evaluated twice if they did not return a Concrete object

- use relationCache also for data query selectors which return data from the queried object

- 600% performance increase for image gallery / (advanced) many-to-many relation asset-assignment imports

- when checking for isModified() during an import first sort fields by whether they are mapped or not -> first check mapped fields because it is more likely that their values got changed (unmapped fields' values can only change when object gets edited by a pimcore.dataobject.preUpdate event handler)

Raw data extraction
-------------------

- add option to skip versioning for asset imports

- support glob expressions in combination with asset folders as import resource, e.g. /import/*.csv when /import is a Pimcore asset folder

Attribute Mapping
-----------------

- recommend index when callback function uses data query selector

- do not auto-reload history panel when dataport runs are filtered (searched) or when currently not page 1 is shown

- add template for adding metadata to assets

History and manual import panel
-------------------------------

- auto-focus SQL condition field when manually starting Pimcore-based dataports from Pimcore backend

- keep SQL condition from previous execution to easier execute the same import/export multiple times (e.g. during dataport setup / testing)

Other changes
-------------

- support (advanced) many-to-many relation as key field (is differently stored in database than (advanced) many-to-many object relation)

- enlarge "fieldNo" column so that 3-digit numbers do not get truncated

- add callback function template to generate absolute asset / thumbnail URL

- bugfix: used wrong method for updating raw items

- bugfix: optimize inheritance: check for parent objects if value got actually changed before saving

- exacter field value comparison when checking for isModified (a change from 0 to '' must get recognized!)

- provide element type + class name in Serializer for relational fields

- bugfix: overlapping imports: already processed raw data items got processed again

- use error-tolerant JSON decoder to not abort the whole import on malformed UTF-8 errors

- bugfix: attribute mapping preview missed configured asset source folder (actual import worked correctly)

- prevent multi-assignment of same asset to image gallery and many-many-relation

- prevent multiple parallel requests for updating history panel

- bugfix: when using relative folder path as import resource, deleting asset file did not work

- in forced imports do not check if element is currently locked for editing

- faster hiding/showing of columns when searching in dataport preview panel

- bugfix: starting exports by right-clicking object in object tree did not work

- bugfix: raw data import did not get correct Logger object (thus logs did not appear on import run logs)

- use application_logs table (if used by data director) to find worst log level + search in logs

- use max runtime when searching in history panel logs to avoid timeout although some items may have been found

- set responsible user who started import at versions for better traceability of changes

- bugfix: excel import with column index did not work

- do not delete raw data of currently exported dataport resources

- import manually uploaded data to default dataport resource

- do not write stack trace to versions in database (is not displayed anyway)

- use custom logic to compare image gallery fields for modification (as Pimcore's getVersionPreview() returns only number of assigned images)

- keep existing meta column data for advanced many-to-many relations of assets properly url-encode URLs for importing assets

- do not try to load Pimcore document which matches the URL path for REST API requests

- add support for like search (wildcard search) in data query selector

- support adding items to multiselect field (instead of having to always provide all options to be selected) -> now works the same as relations, image gallerys and other multi-assignment fields

- bugfix: overlapping imports did not process all raw data

- mark dataport runs as "aborted" if an uncaught exception occurs or process gets aborted (manuall on CLI or automatically by operating system)

- support accessing localized fields in sql condition of Pimcore-based dataports, e.g. name#de='abc'

- support accessing object brick fields in sql condition of Pimcore-based dataports, e.g. brickName.fieldName=123

- bugfix variable $params['rawItemData'] preview in attribute mapping for complex data bugfix demo data for complex XML data bugfix XML parsing: multi-value attributes returned [] for child nodes without value

- INSERT ... IN DUPLICATE KEY for queue items instead of REPLACE INTO -> otherwise currently processed queue items could already been deleted

- support accessing element fields of ObjectMetadata, ElementMetadata, Hotspotimage objects without adding "element:" to data query selector

- try to recognize existing assets for image galleries / m2m relations etc. via md5 hash only if files are stored locally (otherwise needs too much time because asset has to be loaded from remote resource to calculated MD5 hash)

- add warning if no key fields have been specified

- support calling service class methods from within a data query selector, e.g. "field:@service_name::method"

- do not show other users' API keys / allowed dataports (except for admin users -> those are allowed to see all users' API keys)

- prevent all fields being locked when new dataport gets created by non-admin user

- prevent error when generating auto-complete SQL condition

- add "__updated" special field for file- and URL-based dataport types

- use Pimcore user's language for exports when no locale has explicitly been requested

- support '{{ field name }}' / "{{ field name }}" syntax (virtual fields with quotes) to better be able to copy callback functions to reformatting IDEs without getting the code scrambled

- better serialize field collections

- include null values in serializer

- add method Importer::translate() to call DeepL / AWS Translate translations for complex field values

- modification check was not working for field collections with localized fields

- support exporting all assigned bricks with data director "brickFieldContainer" of the source data class

# 2.4.0
Incremental Exports
-------------------

Non-incremental exports first fetch the data from all data objects which match the configured SQL condition and thereafter update this export data when a related object gets saved. Incremental backups do not fetch the data of all matching objects. Instead they fetch the data only from the saved objects and export this data. As soon as the result callback function does not trigger any error for the exported items and does not return false the raw data gets automatically deleted. Then when saving objects the whole process is repeated.

Performance improvements
------------------------

-   check if object got modified by import

    -   for fields which support dirty detection, only compare values if field is dirty -> faster recognition if object got modified by import

    -   do not check values of calculated fields for better performance

-   check earlier if import is allowed to edit existing objects -> performance increase for imports which do not allow editing

-   use prepared statement everywhere to not have to parse SQL queries for every call

-   remove redundant OR conditions like "o_path LIKE '/a/%' OR o_path LIKE '/a/b/%" for automatic exports of objects whose class supports inheritance

-   150% performance improvement for CSV raw data import

-   queue processor for automatic dataports: group queued items by dataport and execute groups in parallel processes → faster and new queued items of dataport X do not have to wait to be processed if there are thousands of items in the queue for dataport Y before

User interface improvements
---------------------------

-   Dataport tree:

    -   support multi-level grouping in tree / repair tree grouping
    
    -   auto-expand tree child nodes if there is only one child (especially when searching / filtering)

-   Dataport config:

    -   raw data field config: set raw data field name automatically from data query selector, column name etc. if not filled

    -   use cell editing for raw data field config (instead of row editing -> you always had to click "Update" before saving)

    -   prevent multiple requests which fetch raw data fields

    -   load demo data for raw data fields asynchronically

-   attribute mapping

    -   make available variables tree for callback functions scrollable

    -   allow raw data field dropdown in attribute mapping to be wider than raw data field column

    -   for imports use first raw data item (ordered by raw item fields) as example data

    -   do not open callback function window when clicking "Parsed" column -> be able to copy values from this column

    -   buffer any output from callback functions -> otherwise there is an error in attribute mapping because of invalid JSON and otherwise there is no possibility to remove the debug statement in the callback function

    -   JSON-encoded preview for virtual fields with complex return types

-   History panel

    -   consume less memory when searching for worst error level in log

    -   prevent multiple parallel requests for updating history panel data

    -   add search field to filter dataport logs / find dataport runs of certain element

-   Preview tab

    -   faster rendering (reducing repaints when auto-resizing columns)

    -   add column header menu item to collapse / expand columns to better be able to find certain column

    -   hide columns where no raw item matches search term

        -   if no non-locked column matches search string, show all non-locked columns

        -   if search string is found in locked column (= key column or manually locked), all columns are shown

    -   quick search now also searches for field / column names -> easier to find column "xyz" when there are a lot of columns

    -   support boolean search in dataport preview

Other changes
-------------

-   add plugin interface so other bundles can provide additional callback function templates, for example [Facebook Feed](https://bitbucket.org/blackbitwerbung/pimcore-plugins-data-director-facebook "https://bitbucket.org/blackbitwerbung/pimcore-plugins-data-director-facebook"), [BMEcat-Export](https://bitbucket.org/blackbitwerbung/pimcore-plugins-data-director-bmecat "https://bitbucket.org/blackbitwerbung/pimcore-plugins-data-director-bmecat")

-   for dataports with Pimcore elements as data source: better serialization of non-scalar results in data query selectors, e.g. to export all fields if a related object

-   support underscore + dash in field aliases in data query selector, e.g. all(field:name#de as name_de)

-   disable SSL certificate check when fetching assets via URL

-   store PHP-compiled data query selector functions in separate files (1 file per data query selector) to not have one huge file per class

-   dynamic abortion threshold -> abort dataport runs only if current batch of 100 raw items takes longer than avg runtime * 6 of 100 previously done items -> imports which need much time by design do not get aborted

-   add helper for UN/CEFACT unit lookup -> e.g. for BmeCat export

-   add helper to convert languages / language codes to different standards (ISO 639-1, ISO 639-2, ISO 639-3, language name)

-   do not use cache for exports with --force

-   bugfix: "force" checkbox when running dataports manually did not work

-   execute imports with "--force" when started via element's context menu

-   support null for boolean select / checkbox

-   bugfix: auto-create raw data fields for CSV did not work with special-char delimiters (e.g. \t)

-   wrap virtual field replacements in braces -> makes casting possible with (int){{ virtual field name }}

-   do not wait 30 seconds for edit-lock to be unlocked because user could save object but in import object is at that time already loaded based on the previous state

-   prevent that same object gets imported from 2 dataports in parallel to prevent data loss

-   add checkbox to auto-create quantity value units (incl. base unit, conversion factor + offset)

-   provide logger in result callback function + result document action

-   BC break: complex data in $params['value'] / $params['rawItemData'] now gets provided as array instead of as stdclass.

-   remove redundant OR conditions like "o_path LIKE '/a/%' OR o_path LIKE '/a/b/%"

-   do not skip importhash property in isModified() when latest version did not have this attribute → otherwise property did not get saved initially

-   correctly sort raw data items with numerical fields

-   bugfix: using virtual fields inside virtual field callback function was not possible for exports

-   bugfix: different SQL conditions of dataport resources were not used for queuing automatic dataports

-   bugfix: advanced many-to-many object relations:

    -   do not add object if already present in relation (and it is not allowed to assign same object multipe times)

    -   fill meta fields which have not been provided with null to ensure AdvancedManyToManyObjectRelation::getForWebserviceExport() does not throw an exception

# 2.3.0
Optimizations for (automatic) exports
-------------------------------------

-   Better mechanism to ensure that only 1 queue processor process is running.

-   Delete raw data of automatic exports only if raw data item is not covered (anymore) by dataport condition because it gets updated anyway just a few seconds and it is also was a problem when the export got requested in the few seconds between deleting the raw item and updating it with the new values - in this case the item was missing in the export. This does now not happen anymore.

-   background process did not use the cached export document. For this reason even in case that the raw data did not change, the export document had to be recreated completely. Now raw data processing just gets aborted if the cached export document is still up to date.

-   wait for running raw data extraction to finish when export is requested (to not export incomplete data)

Edit-locking
------------

When an import recognizes that an object is changed but is currently opened by a user in the Pimcore backend, it notifies the user to finish work and afterwards close the object to prevent changes of the import being overwritten as soon as the user clicks the save button. If still locked after 30s waiting, import of the remaining raw items gets queued to be processed later (and skip for current import run). If the object does not get unlocked within the next hour, the import will be done anyway (this copies Pimcore's behavior of showing the edit-lock notification for max. 1 hour is another user opened the object).

Additionally the data director itself obtains an edit lock in the imported objects to notify Pimcore users that an import is running (same notification as if 2 users open the same object at the same time).

Templates for uploading exported documents to cloud hosting providers
---------------------------------------------------------------------

There are nor ready-to-be-used templates for uploading exported documents to cloud storage providers like AWS S3 and Google Storage.

Also we enhanced uploading exported documents via (S)FTP and FTP Secure.

Enhanced dataport configuration
-------------------------------

Dataports with Pimcore as import type now support auto-complete in the SQL condition for the dataport.\
Also the auto-suggest for data query selectors of raw data fields of Pimcore-based dataports has been improved to always show next possible steps.

In attribute mapping it is now possible to use localized fields as key fields.\
Additionally in attribute mapping panel we enhanced:

-   better performance loading preview data

-   do not show debug / info logs in attribute mapping panel preview (but only "real" errors)

-   bugfix: $params['currentValue'] variable preview did not work for unmapped fields

In dataport preview the configured key fields are now locked. This means that you can scroll horizontically through the other raw data fields while the key fields stay visible.

Translation Providers
---------------------

-   support AWS Translate as translation provider (in addition to existing DeepL implementation)

-   bugfix: DeepL had problems with recognizing word separators when only \<br\> tags were used without wrapping whitespaces

-   bugfix: saving translations to cache to reuse translations / save money did not work

Minor changes
-------------

-   support returning DateTime object from callback functions for date and datetime fields (when using PHP as callback function language)

-   sort available classes by name for dropdown in dataport settings

-   add template to create QR codes as SVG

-   do not propose example query for exports in REST API documentation

-   prevent multiple parallel history reload calls

-   do not block session until import / export is finished (only applies when dataport run is started from Pimcore UI)

-   only remove raw data when saving dataport if raw data fields got changed -> do not remove raw data when dataport name or any other option got changed

-   add translate helper function to be used in data query selectors (uses Pimcore translations)

-   delete dataport resources which have not been used recently (configurable with blackbit_pim.importstatus.cleanup_interval parameter)

-   support importing JSON documents like [{field1: value1}] with JMESPath expression "."

-   use Pimcore default language as default locale for listing queries → allows to query for localized fields in SQL condition

-   hide "target folder" field when setting import mode to "edit only"

-   fix pagination of history panel when some jobs are in queue

-   auto-activate "key field" checkbox in attribute mapping when field is unique or has index and raw data field gets assigned

-   bugfix: when calling command dd:process with certain raw data items, only dataport resources of those given items should be used (previously used all dataport resources of given dataport)

# 2.2.0
Import type "Reports"
---------------------

Pimcore reports are a feature to display information from Pimcore database or Google Analytics (but is also extendable to other connectors). Using the reports as import source enables for example to:

-   send reports by mail (e.g. notify the responsible users when an action for the report objects is necessary)

-   import data from Google Analytics into your Pimcore data objects to further use this data

Memory optimizations
--------------------

With this version memory usage decreases a lot. Especially the raw data processing (import raw data to Pimcore data objects) got optimized.

But also dataports with type "Pimcore" now use much less memory because before aa objects got loaded to memory and then processed. Now only the currently processed ones get loaded and afterwards removed from memory.

Support easy to set up logic operations for exports
---------------------------------------------------

It is now easier to set up logic operations for export fields as they now also support callback functions.

Minor changes
-------------

-   recognize strings like "10 kg" for quantity value fields

-   support default unit for quantity value fields if no unit provided in import data

-   add shortcut $ for .:.:.: in data query selectors (e.g. to be used for placeholders within texts)

    -   e.g. you could have "Buy $name now" in a field for a product's SEO title. This then gets replaced to "Buy christmans socks now" when there is an input field "name" in the current object's class which has the value "christmas socks".

-   support stream wrappers for logs

-   add result callback function to get raw data as HTML table

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
