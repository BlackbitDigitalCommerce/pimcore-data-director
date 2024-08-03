# Data Director: Pimcore imports, exports, automation

Pimcore plugin to optimize Pimcore concerning all PIM-related features, especially imports, exports, automation, workflows

- [Presentation](https://www.youtube.com/watch?v=V0fgqcKkhGI&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=7&t=1080s&pp=iAQB)
- [YouTube videos for diferent use-cases](https://www.youtube.com/playlist?list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt)
- [Documentation](https://blackbitdigitalcommerce.github.io/pimcore-data-director)

* * *

## What does this plugin do?

This plugin imports data from external XML, JSON, CSV, Excel data sources (for example from an ERP system), stores them to an intermediate raw data table, and then creates / updates data objects, assets and documents with this data.

In the Pimcore backend GUI you can define which data is to be extracted from the import source and assign it to the object fields of your Pimcore objects. All Pimcore data types are supported for import. Also the import of assets and documents is possible (including editing metadata, tags etc.).

During the import, data can be modified and adapted to your data model. This plug-in provides extensive functionality and a convenient user interface and is a battle-tested solution for importing structured data into Pimcore objects, assets and documents. It reduces the effort of programming individual interfaces and reduces the time to commissioning your Pimcore project.

![Import workflow](doc/images/dataflow.jpg)

It is also possible to export data of the fields you want - including data from relations, images / thumbnails etc. With the intelligent caching system exports are really fast as export data gets updated in the moment when an object gets saved (in the background, so saving does not take any longer) and not when the export is requested. For exports we already provide lots of ready-to-be-used templates:
* CSV exports
* CSV as zip file including assets
* JSON exports
* JSON as zip file incl. assets
* XML exports
* XML exports as zip file incl. assets

This way you can on the one hand create / edit objects, assets and documents in your Pimcore. On the other hand you can use this bundle to **create fully customizable REST API endpoints with configuration only** (everything is configured in Pimcore backend).

It is also possible to not only generate those export documents but you can also specify what to do with the export document: the bundle already ships with the following ready-to-be-used result action templates:
* send export document via email
* upload export document via (S)FTP, AWS S3 and other cloud storage providers

With the automatic mapping functionalities and the provided templates setting up imports and exports is a matter of minutes - in most cases without any programming necessary. But of course if you want to adjust import or export data, you can by using callback functions.

For an overview how to set up imports and exports, please see our [tutorial videos](https://www.youtube.com/playlist?list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt).

* * *

## Example use-cases

Just some examples which the Data Director has been used for:

* Import / Export data to ERP systems like SAP, Navision / Business Central, Infor, Webware, JTL etc.
* Automatically export e-commerce data to online shops like BigCommerce, Shopware, Shopify, xt:commerce etc.
* Import / Export BMEcat (in general or for platforms like Mercateo, PSG, Wucato)
* Import / Export content from / to Wordpress, Hubspot, Typo3
* Import / Export customer-related data from / to CRM systems like Salesforce, Hubspot
* Export e-commerce related information to Hubspot to automate email marketing
* Create product feeds for marketplace syndicators like ProductsUp, Channable etc.
* Create exports feeds for SaaS search providers like FactFinder, Doofinder etc.
* Export product data to be used in InDesign for product catalogs, datasheets etc.
* Create product feeds for Google Shopping / Merchant Center, Facebook etc.
* Import product data from Icecat, Bidex
* Synchronize asset file folder / DAM system with Pimcore assets
* Implement data quality checks incl. notification
* Create REST APIs for reading / writing information from / to Pimcore
* Automatic translation with DeepL / AWS Translate
* Connect to translation providers like Trados
* Automatic text generation with artificial intelligence (OpenAI.com API (ChatGPT), GPT-3, GPT-4)
     
## Advantages compared to other Pimcore import plugins

* everything is configurable in Pimcore backend user interface - no creation of PHP files or anything similar necessary, even for complex imports
* better import performance
    * streaming input files allows to also import huge import files
    * lot of optimizations to accelerate importing data to Pimcore elements - or to check previously if data actually changed (and if not skip import or saving to save time)
* auto-complete functions to set up imports very fast and to suggest how to proceed even with complex imports
* flexible import resource, you can import data from:
    * single files
    * folders
    * URLs
    * PHP script for complex requirements like importing a CSV file only if a PDF file with the same file name (but different file extension) exists in the import folder
    * cURL requests to import data from resources which need OAuth or similar authentication (but of course you can also use a PHP script in this case which authenticates and then provides the data to be imported)
* Supported import formats:
    * CSV
    * XML
    * JSON
    * Excel
    * Pimcore elements (data objects, assets, documents)
    * Pimcore reports (e.g. to import data from Google Analytics, external databases or other Pimcore database tables)
    * File system (e.g. to import assets)
* full flexibility: for common use cases of data transformation the bundle provides ready-to-be used templates. But you can also edit those and even write custom (PHP or JavaScript) functions to set up a transformation pipeline, conditions etc. for certain fields
* import object hierarchy (set parent element of imported elements)
* option to write-protect fields: only import data to certain field if field is empty
* dynamically import to object brick / classification store fields (target field can be defined dynamically based on import data)
* generate response documents, for example to send success status back to source system
* automatically start imports based on events, for example to:
    * automatically assign assets to data objects after uploading an asset
    * automatically start import for uploaded CSV, JSON, XML, Excel file
* trigger imports via push from external systems (via REST API) for live interfaces without exchanging files
* Traceability: import archive (for import files) and searchable import log history to always know when and why a certain field got a certain value
* revert imports: if data loss happened due to a mistake, only revert imported fields to certain date - much better than having to restore a database dump (because data of non-imported fields is kept)
* dataports are also stored as JSON files -> easy to trace changes via VCS (Git), easy to deploy between Pimcore instances. Also downloading and importing dataport configuration is supported.
* [Optimize inheritance feature](https://www.youtube.com/watch?v=l6s6YnbFOxM)
* Permission system: for each dataport you can configure who is allowed to configure and / or execute the dataport
* import different types of elements: 
    * Data objects
    * Assets
    * Documents
    * Quantity value units (incl. conversion factors)
* built-in interface to translation providers (DeepL, AWS Translate) to set up automatic translation with just one click (incl. caching of translations to save costs for recurring translation strings)
* artificial intelligence features, e.g. to automatically assign categories based on product name and description

## Advantages compared to other Pimcore export plugins

* automatically execute or prepare exports whenever an object gets saved whose data gets exported to:
  * prepare export once the data changes, so that the data does not have to be generated in the moment when the export is requested -> very fast exports because the export document is already available in the moment of request
    * data is not extracted again and again from the Pimcore database but only when elements change
  * upload exports automatically to a target system to always have up-to-date data there
  * automatically send data the other APIs, e.g. online shops, marketplace distributors
* full flexibility for format / document structure of export document to tailor the export document structure exactly how the target system expects it
* access any data which is connected to exported object, for example when exporting products you can easily access assigned categories, images of the assigned categories and even meta data of the images of the assigned categories - you can chain that as long as you want
* full flexibility in setting up a transformation pipeline to change values to the desired format (e.g. date format conversion, convert quantity values to certain units etc.)
* predefined export templates to create CSV, XML, JSON exports with or without referenced asset files (e.g. CSV file plus assets (or thumbnails) packed in a zip archive)
* intelligent checks whether anything changed since the last export. If nothing changed, result document gets delivered from cache
* access exports via URL, for example to pull data feed in an external system
* filter elements to be exported by any field, either filter via dataport configuration or use ad-hoc filtering for one-time exports

## Advantages compared to own import implementation

* Minimization of programming effort: Only data modifications from the data source require minimal programming
* Performance:
    * Data is only imported if nothing has changed since the last import
    * If an object has not changed during import, it does not need to be saved
    * Export data gets updated when objects change, so it is already prepared in the moment an export gets requested
* Flexibility:
    * Imports and exports are fully customizable to data source and your Pimcore data model
    * Supports all Pimcore elements including data objects, object bricks, field collections, assets and documents
    * Supports importing tags and properties
* Transparency:
    * with import archive and searchable import log history you can always trace why a certain field got a certain value and which import file was responsible for this
    * always see current import / export status (progress of current job, number of queued items)
* Comfort functions: 
    * Automatically extract raw data fields from import resources
    * Automatically map raw data fields to Pimcore class fields
    * [Optimize inheritance feature](https://www.youtube.com/watch?v=l6s6YnbFOxM)
    * Replace placeholders (for example to generate texts automatically)
    * Automatic translation (with DeepL API)
    * Error monitoring / notification of imports
    * Revert imports
    
## One for all

**Data Director is ONE bundle for:**

* **importing data to Pimcore elements**
* **checking and changing data when data objects get saved -> more transparency compared to overriding Pimcore model classes' `save()` method or creating event handlers**
* **exporting data in whatever format you want and wherever the export documents shall be sent to**
* **automation of data handling within Pimcore**
* **support UX-optimized workflows for frequent tasks**

Initial effort is only necessary once, compared to when you have multiple bundles for all the different requirements which the Data Director is able to fulfill.  

## How to get the plugin

You can buy this plugin in the [Blackbit Shop](https://shop.blackbit.com/pimcore-data-director/) or write an email to [info@blackbit.de](mailto:info@blackbit.de).

## Demo

You can test the Data Director at our Pimcore demo system by [requesting the demo login credentials](https://digital-commerce.blackbit.com/en/pimcore_data_director_demo).

* * *

## Workflow

### Step 1: Import CSV, XML, JSON or Excel into Pimcore

This plugin has proven itself in many e-commerce and master data management projects and has been developed according to the needs of our customers.

The aim of the plug-in is to import information from upstream systems into the objects of Pimcore, there appropriately enrich them with further information and publish them via Pimcore itself or via a downstream system such as an online shop.

The import always takes place in two steps: In the first step, an intuitive user interface determines which columns of a CSV file or which attributes of an XML / JSON document should be imported into Pimcore.

A preview shows directly if the raw data fields are set up correctly. The import reads the data into an "intermediate table" so the user can see which data was imported from the upstream system before it is further processed in the next step.

![Import workflow](doc/images/setup-raw-data-fields.png)

### Step 2: Mapping Attributes via Drag-and-Drop

In the second step, the information from the intermediate table is assigned to the attributes of the classes. Thise mappings get individually defined in the Pimcore backend UI via drag-and-drop.

There one or more key attributes get set so that the import process can be repeated and existing objects get updated.

The attribute mapping can also be used to modify the source data. For each field assignment, a callback function can be specified, which, for example, performs date format operations or other calculations on the basis of one or multiple imported or existing attributes of the current object.

![Attribute mapping](doc/images/attribute-mapping.png)

* * *

## Further highlights at a glance

* File-based imports (monitoring of a directory and automatic import on new files), for example for:
  * automatic asset imports into the Pimcore (e.g. from a network drive)
  * automatic mapping of assets to Pimcore objects by file name
* Import multiple files (CSV, XML, JSON, Excel) from a source directory with automatic dataset deduplication
* Import from a URL as a data source
* Import data from Pimcore objects:
  * Migrate data from one field type to another without data loss
  * dynamic mass data manipulation (currently that is not possible in the Pimcore grid (for example, increase prices by 10%))
* Import data from Pimcore reports
  * e.g. to send reports by mail (e.g. notify the responsible users when an action for the report objects is necessary)
  * e.g. to import data from Google Analytics into your Pimcore data objects to further use this data
* Import of documents (filling of the editables)
* Generate response documents
  * generate a response document including all successfully imported items and send that to the source system
  * track import errors
  * call another import which depends on the current one
  * create export documents (JSON / CSV / XML etc.) which other systems can use as import source
  * create response documents for single-page application / PWA frontend requests
* execute imports and exports with the built-in REST API
* Skipping records from the import source, e.g. if data is missing or the quality is insufficient
* easy import of relations
* automatically assign elements to relations via artificial intelligence / machine learning
* Import of object hierarchies / object trees
  * Specification of the parent element possible
  * Option to optimize inheritance (data is entered as high as possible in the object hierarchy)
* Automatic translation of texts via translation providers (via DeepL or AWS API)
* Support of all Pimcore data types including relations with metadata, object bricks, field collections etc.
* optimized performance:
  * If the source data has not changed, the import of the data record can be skipped
  * If data of an object is not changed in the import, it does not need to be saved
* generate barcode and QR code images
* Possibility to revert imports:
  * If an attribute assignment error has crept in and several thousand objects have been filled with incorrect data, the change can be reverted - in this case only the fields mapped in the import are set back, only for the objects changed in the import - a big advantage over a complete backup restore


## Frequently asked questions (FAQ)

### Import

* Is it poosible to create folders or an object hierarchy (import one object below another in the data object tree)?
  * Yes. You can create folders or put an imported object below another object. You can also assign a parent element dynamically based on the import data. There is also a [tutorial video about how to set up an object hierarchy](https://www.youtube.com/watch?v=nyhKJTzTq-4&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=1&t=2962s).

* How can existing objects be updated?
  * You can assign any field of your data object class as a key field. At the beginning of the import it is tried to find an existing object which has the imported values in this key field. It one is found, this object gets updated. For example this can be a SKU for product objects. Also combined key fields are possible, e.g. when your products have a product number and a color - only the combination of product number and color is unique, so you can set both as key fields.

    It is also possible to set the import mode to *only update existing objects* (and not create new ones). This is helpful when you gather data for one data object class from different sources. For example when the product data gets imported from an ERP system but the prices come from pricing system. In this case it could happen that the pricing import gets a product SKU which does not exist yet. In this case you might not want to create a new object only with the price but every other field empty.
    
    It is even possible to update multiple objects from one import dataset. So the used key field does not have to be unique. This can be useful if want for example to update all objects which have a certain object assigned to a many-to-many relational field. For more details, we have recorded a [tutorial video about updating multiple objects from one import dataset](https://www.youtube.com/watch?v=OJKxWtgwi3c&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=3&t=324s)
  
* Is it possible to assign the target class dynamically?
  * Every dataport has exactly one target class. But of course you can create multiple dataports which have different target classes. All of them can use the same import file. And as you can skip import items it is possible that every dataport processes the import items which it shall handle. So to summarize: Yes, you can dynamically assign the target class.

    Beside skipping it is also possible to use only some fields. For example you could use a product CSV file with a manufacturer column to create Manufacturer data objects in one dataport and to assign the maniufacturer object to the product in another dataport. It is even possible to connect multiple dataports to a pipeline - in this case first create the Manufacturer objects and afterwards assign them to products. 

* How can localized fields be filled?
  * A localized field can be mapped for every language individually. This way you can assign different columns / fields from your import file to the different languages of the localized field.
  
    Moreover there is a built-in feature to automatically translate values using the DeepL or AWS Translate API. For more details [see the tutorial video about automatic translations](https://www.youtube.com/watch?v=OJKxWtgwi3c&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=3&t=1963s).
  
* How can other objects be assigned to relation fields?
  * You can query related objects by any field of the related object class. For example you can assign a Manufacturer object to a product by querying for a Manufacturer object which has `ABC` in its `name` field. The actual logic is implemented in callback functions within Pimcore backend (no need to create any PHP files or classes somewhere). You do not have to write complex PHP code for this task but we deliver templates for most common tasks. For example to assign above mentioned Manufacturer object, you can just select the function `Assign Manufacturer object by name` from the template list. We also recorded a [tutorial video about assigning related objects](https://www.youtube.com/watch?v=nyhKJTzTq-4&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=1&t=2352s).
  
* Is it possible to transform import data?
  * Yes. For every field you can implement custom logic in a callback function (inside the Pimcore backend, you do not have to create any PHP files somewhere). In this callback function you get the import data and the current object data provided and cam use any language construct like conditions, loops etc. You can use PHP or JavaScript to implement those callback functions.
  
* How to assign assets?
  * Assets can be assigned via URL, file system path or you can query for existing assets.
    You can wither create the assets during a data object import (e.g. when you have a product feed with image URLs). For more details see the [tutorial video about assigning images](https://www.youtube.com/watch?v=nyhKJTzTq-4&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=1&t=3139s).
    
    Or you import assets individually, e.g. when you connect a network drive to your Pimcore server and want to automatically import assets from this folder into Pimcore. For more details see [the tutorial video about importing assets from the filesystem](https://www.youtube.com/watch?v=OJKxWtgwi3c&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=3&t=4161s)
    
* Can you import multiple files at once? What import resources are supported
  * Yes. You can import files one by one, files from a folder (including search pattern, e.g. /import/*.xml), files from remote storage ((S)FTP), Files from Pimcore Assets, data from a URL, data from a cURL request, data from a PHP script. The two latter are especially useful when you want to import data from an API which required authentication.
  
* How can imports be started?
  * Imports can be started:
    * manually from the Pimcore backend
    * manually via right-click on objects inside the target folder or on assets inside the source folder (when the source folder is inside Pimcore assets)
    * manually or automatically via command-line, this can also be used for periodic imports when called by a cronjob or the [Process Manager Bundle](https://github.com/elements-at/ProcessManager)
    * manually or automatically via REST API, this can be used to push data from the source system to Pimcore without exchanging files between the systems.
    * automatically when import source changes. This can for example be when a new file gets uploaded to a certain folder, you can automatically start an import (one use-case is to automatically assign assets to products by extracting the SKU from the assetfilename).
    * automatically with dependent imports / dataport pipelines
    
  For more details we have recorded a [tutorial video about the different ways to start imports](https://www.youtube.com/watch?v=otC8-8SYNIM&list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt&index=2&t=2156s).

## Documentation

To learn more about all options and how they can be configured, please [read the full documentation](https://blackbitdigitalcommerce.github.io/pimcore-data-director/) or [watch the tutorial videos](https://www.youtube.com/playlist?list=PL4-QRNfdsdKIfzQIP-c9hRruXf0r48fjt).

## Training

We also offer an [academy course for Data Director](https://academy.blackbit.com/collections/blackbit-data-director-for-pimcore).