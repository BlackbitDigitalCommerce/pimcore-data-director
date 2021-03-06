# Pimcore Data Director Bundle

formerly known as Pimcore Import Plugin

Feature-rich import and export bundle to connect external systems to Pimcore

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

## How to get the plugin

You can buy this plugin in the [Blackbit Shop](https://shop.blackbit.de/de/pimcore-modul-bb-import).

* * *
     
## Advantages compared to other Pimcore import plugins

* everything is configurable in Pimcore backend user interface - no creation of PHP files or anything similar necessary, even for complex imports
* better import performance
  * streaming input files allows to also import huge import files
  * lot of optimizations to accelerate importing data to Pimcore elements - or to check previously if data actually changed
* auto-complete functions to set up imports very fast and to suggest how to proceed even with complex imports
* flexible import resource, import data from:
  * single files
  * folders
  * URLs
  * PHP script for complex requirements like importing a PDF asset file only if a CSV file with the same file name exists in the folder
  * cURL requests to import data from resources which need authentication (but of course you can also use a PHP script in this case which authenticates and the provides the data to be imported)
* Supported import formats:
  * CSV
  * XML
  * JSON
  * Excel
  * Pimcore elements (data objects, assets, documents)
  * Pimcore reports (e.g. to import data from Google Analytics, external databases or other Pimcore database tables)
  * File system (e.g. to import assets)
* full flexibility: for common use cases of data transformation the bundle provides ready-to-be used templates. But you can also edit those and even write custom (PHP or JavaScript) functions to set up a transformation pipeline
* import object hierarchy (set parent element of imported elements)
* option to write-protect fields: only import data to certain field if field is empty
* generate response documents, for example to send success status to source system
* automatically start imports, for example
  * automatically assign assets to data objects after uploading
  * automatically start import for uploaded CSV, JSON, XML, Excel file
* trigger imports via push from external systems (via REST API) for live interfaces without exchanging files
* Traceability: import archive (for import files) and searchable import log history to always know when and why a certain field got a certain value
* revert imports: if data loss happened due to a mistake, only revert imported fields to certain date - much better than having to restore a database dump (because data of non-imported fields is kept)
* dataports are also stored as JSON files -> easy to trace changes via VCS (Git), easy to deploy between Pimcore instances. Also downloading and importing dataport settings is possible.
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

* access any data which is connected to exported object, for example when exporting products you can easily access assigned categories, images of the assigned categories and even meta data of the images of the assigned categories - you can chain that as long as you want
* full flexibility for format / document structure of export document
* predefined export templates to create CSV, XML, JSON exports with or without referenced asset files (e.g. CSV file plus assets (or thumbnails) packed in a zip archive)
* automatically execute exports whenever an object gets saved whose data gets exported to:
  * prepare export once the data changes, so that the data does not hasve to be generated in the moment when the export is requested
  * upload exports automatically to a target system to always have up-to-date export there
* intelligent checks whether anything changed since the last export. If nothing changed, result document gets delivered from cache
* access exports via URL, for example to pull data feed in an external system

## Advantages compared to own import implementation

* Performance:
    * Data is only imported if nothing has changed since the last import
    * If an object has not changed during import, it does not need to be saved
    * Export data gets updated when objects change, so it is already prepared in the moment an export gets requested
* Flexibility:
    * Imports and exports are customizable to data source and your Pimcore data model
    * Supports all Pimcore elements including data objects, object bricks, field collections, assets and documents
    * Supports importing tags and properties
* Minimization of programming effort: Only data modifications from the data source require minimal programming
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
* **checking and changing data when data objects get saved -> more transparency compared to overriding Pimcore model classes**
* **exporting data in whatever format you want and whereever the export documents shall be sent to**

Initial effort is only necessary once, compared to when you have multiple bundles for all the different requirements which the Data Director is able to solve.  

* * *

## Workflow

### Step 1: Import XML, Excel and CSV into Pimcore

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

## Documentation

To learn more about all options and how they can be configured, please [read the full documentation](https://pimcore.blackbit.de/Blackbit/1.pimcore/Handb%C3%BCcher/Ultima-Import-Bundle.pdf).