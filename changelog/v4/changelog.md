# Changelog

## 4.0

### Breaking changes

- Pimcore floor raised to `^2025.4 || ^2026.0` (Pimcore 12.3+). The `require` entry switched from `pimcore/pimcore` to `pimcore/platform-version` -- the meta-package recommended for Pimcore 12+ that pins the entire Pimcore ecosystem (admin-ui-classic-bundle, studio-backend-bundle, generic-data-index-bundle, etc.) to a coherent version set rather than just the core. Promoted from `require-dev` to `require`. Older Pimcore versions are no longer supported. The `^2025.4` constraint does not overlap with the Pimcore 11.x line; 12.3 is the first version that satisfies it.
- `psr/log` constraint tightened to `^3.0`.
- PHP floor implicit at `>= 8.3`.

### Removed back-compat scaffolding

- All `version_compare(Helper::getPimcoreVersion(), ...)` branches that target Pimcore 10 / 11.3 / older now resolve to the surviving Pimcore 11.5+/12 path.
- psr/log v1/v2 sibling classes deleted; canonical `Logger`, `InMemoryLogger`, `RawItemLogger`, `TagLogger`, `EmailReportingLogger`, `WorstErrorImportStatusLogger`, `CriticalErrorLogger` now ship the modern `Stringable|string` `log()` signature directly.
- `Php8` sibling classes collapsed into their canonical types for `Mail`, `GenericObjectRelation`, `HtmlContainer`, `WysiwygWithPlaceholders`, `InputWithPlaceholders`, `TextareaWithPlaceholders`, `CalculatedValueDataQuerySelector`, `BackingUpResponse`. Their `PhpCompatibilityTrait` shims are removed.
- `CurrencyConverter::convert()` now uses the `AbstractQuantityValue` signature unconditionally.
- `DataQuerySelector` (grid operator) now extends `AbstractOperator` directly with the modern `getLabeledValue()` return type.
- `LoggerAwareInterface`, `LogFormatter`, `PimcoreLoggerHandler`, `ApplicationLoggerDb` collapsed onto the Monolog 3 / psr/log v3 path.
- `RuntimeCache::getInstance()` always returns `Pimcore\Cache\RuntimeCache`.
- `PimcoreDbRepository` now uses `Doctrine\DBAL\ArrayParameterType` / `ParameterType` unconditionally; the `SQLParserUtils` fallback (gone in DBAL 3) is removed.
- `AbstractTranslationProvider` now uses `Pimcore\Model\Translation::setKey`/`setDomain` unconditionally; the `Translation\Website` fallback is removed.
- `QuantityValueMapper` uses `InputQuantityValue` unconditionally.
- `BackingUpResponse::getFileExtension()` collapsed to the `Symfony\Component\Mime\MimeTypes` branch; the `Pimcore\Tool\Mime` fallback (with embedded MIME map) is removed.
- `EventListener\ClassChangedListener` now reads `$containerConfig['config_location']` directly; the `LocationAwareConfigRepository::getStorageConfigurationCompatibilityLayer` branch was removed (the method no longer exists in Pimcore 12).
- `PHP_VERSION_ID < 80000` guards removed across `CallbackFunction`, `DataQuerySelectorResolver`, `NaiveParser`, `StreamingXmlParserFallback`, `XmlParser`. The deprecated `libxml_disable_entity_loader(false)` call is removed.
- Migration `Version20250408075905` and `Version20250408161956` now target `translations_messages` directly (the `translations_website` branches were unreachable on the supported floor).
- SFTP file system support now requires `league/flysystem-sftp-v3`. All `League\Flysystem\PhpseclibV2\Sftp{Adapter,ConnectionProvider}` references rewritten to `PhpseclibV3` equivalents. `phpseclib/phpseclib` and `league/flysystem` constraints tightened to `^3.0`.
- The `fallback/` directory (150 files, formerly registered via `"": "fallback/"` PSR-4 autoload) is removed. `PimcoreCompatibility.php` and `PimcoreCompatibilityTrait.php` deleted; the `kernel.cache_clearer` service entry only printed an autoload-hook hint and is removed. The `pre-autoload-dump` hook on consuming projects is no longer needed -- the resulting "Ambiguous class resolution" warnings during `composer install` will not reappear.
- `lib/Pim/EventDispatcher.php` wrapper deleted. The wrapper bridged the Symfony 3 reversed-arg `dispatch()` signature and probed `hasListeners()`; both are unnecessary on Symfony 6+/7+. All call sites now use `\Pimcore::getEventDispatcher()` (returns `Symfony\Contracts\EventDispatcher\EventDispatcherInterface`) directly. The corresponding service entry in `Resources/config/services.yml` is removed.
- `Helper::prefixObjectSystemColumn()` inlined at all ~330 call sites and the helper itself deleted. The helper was a no-op identity since Pimcore 11+; the `o_*` column prefix was dropped in Pimcore 11. Migrations `Version20220120135252` and `Version20220615123042` are updated in place.
- `Helper::getPimcoreVersion()` deleted. The single remaining caller (`ImportController::statisticsAction`) now calls `Composer\InstalledVersions::getVersion('pimcore/pimcore')` directly. The cached `$pimcoreVersion` static is removed.
- `lib/Pim/RawData/UuidGenerator.php` deleted. The wrapper guarded `Uuid::uuid6()` with `method_exists` and manually converted UUIDv1→v6 on older ramsey/uuid releases. With `ramsey/uuid` tightened to `^4.7` (the release that introduced `Uuid::uuid6()`), the guard is dead. Three call sites now use `Ramsey\Uuid\Uuid::uuid6()` directly.
- `EventListener/ClassChangedListener::addPreviewService()` collapsed: the `method_exists($classDefinition, 'setPreviewGeneratorReference')` guard is always true on the Pimcore 12.3+ floor (declared on `ClassDefinitionInterface`) and the `elseif (method_exists($classDefinition, 'setPreviewUrl'))` branch is unreachable (`setPreviewUrl`/`getPreviewUrl` were removed from Pimcore 12). Method reduced to the single `setPreviewGeneratorReference('@DataDirectorPreview')` assignment.
- `User::getApiKey()` fallback removed at 4 sites (`Controller/ImportController.php` × 2, `Controller/RestController.php` × 2). Pimcore 12 dropped the per-user API key property from `Pimcore\Model\User`, so the `method_exists($user, 'getApiKey')` guard returns false everywhere and the body never executed. The DD-managed `plugin_pim_api_keys` table lookup that precedes the guard is now the only path.
- `Controller/ImportController.php` localized-fields handling: removed the inner `method_exists($localizedFields, 'setLoadedAllLazyData')` guard. `Localizedfield::setLoadedAllLazyData()` is part of Pimcore 12's standard model. The outer `method_exists($object, 'getLocalizedFields')` guard stays — that's an instance-level capability check (autogenerated only on concrete classes with localized fields).
- Second pass on Pimcore-12.3 floor guards across the bundle. Each guard verified against `vendor/pimcore/pimcore` v2026.1.1, `doctrine/dbal` 4.4.3, `phpoffice/phpspreadsheet` (post-3.0), and the Symfony 6+/7+ component lineup that the Pimcore floor mandates:
    - `method_exists(Db::getConnection()->getConfiguration(), 'setSQLLogger')` guards removed at 4 sites (`lib/Pim/Helper.php` × 2, `lib/Pim/Item/Importmanager.php`, `lib/Pim/RawData/Importmanager.php`, `Controller/ImportconfigController.php`). DBAL 4 removed `Configuration::setSQLLogger()` -- the guard returned false everywhere; the body was unreachable. Pimcore 12 doesn't register a default SQL logger anyway, so removing the dead block has no behavioral impact.
    - `class_exists(Symfony\Component\ErrorHandler\DebugClassLoader::class)` guards removed at 5 sites (same files as above plus `Controller/ImportconfigController.php`). `symfony/error-handler` is a hard Pimcore-12 dep; the class is always present. Body (`DebugClassLoader::disable()`) now runs unconditionally.
    - `method_exists(\Doctrine\Deprecations\Deprecation::class, 'disable')` guards removed at 4 sites. `doctrine/deprecations` is a hard Pimcore-12 transitive; `Deprecation::disable()` exists at L249. Always-true guard.
    - `class_exists(Symfony\Component\Mime\MimeTypes::class)` guards removed at 3 sites (`lib/Pim/Import/helpers.php` × 2, `lib/Pim/Parser/ResourceBasedParser.php`). `symfony/mime` is a hard Pimcore-12 dep. The fallback path used the now-deleted `Pimcore\Tool\Mime::detect()`. Three orphaned `use Pimcore\Tool\Mime;` imports removed; one orphaned `use Symfony\Component\Mime\MimeTypes;` import removed from `lib/Pim/Item/Importmanager.php` (the file's `MimeTypes` use had been dead since an earlier refactor).
    - `class_exists(Composer\InstalledVersions::class)` guards removed at 4 sites (`BlackbitDataDirectorBundle.php`, `Controller/ImportconfigController.php` × 3). Composer 2 ships `InstalledVersions` as part of the runtime; Pimcore 12 requires Composer 2 in practice. `ImportconfigController::updateAvailable()` flattened from nested-if-cascade into early-return shape during this cleanup.
    - `method_exists($listing->getDao(), 'getQueryBuilder')` guard removed at `Controller/ImportconfigController.php:2007`. All four element-type listing DAOs in Pimcore 12 (Asset/Document/DataObject/Translation) implement `getQueryBuilder()`. The else-branch using the older `$listing->getQuery()` was unreachable. The companion `getTableName` guard at L2046 was kept -- only `DataObject\Listing\Dao` implements that one; the others don't. Genuine instance-level check.
    - `method_exists(Excel::class, 'getSheet')` guard removed at `model/Dataport.php:295`. `getSheet()` exists on `Spreadsheet` at L694 across all supported PhpSpreadsheet majors (the constraint floor is `^3.0`). The fallback `ExcelParser` branch was unreachable; only `ExcelParserFast` remains.
    - `method_exists($translation, 'getDomain')` clause removed from a compound conditional in `EventListener/TranslationListener.php:54`. `Translation::getDomain()` exists at L167 of Pimcore 12's `Translation` model. After the preceding `$translation instanceof Translation` check passes, the method always exists -- the middle clause was dead.

Guards intentionally left in place during this pass:
- All `method_exists` and `class_exists` checks against DD-internal parser/logger/translation-provider interfaces (`setSourceFile`, `setForce`, `setStatusKey`, `setConfig`, `getConfig`, `setLogFileObject`, `disableLoggingNotFoundImportResource`, `createGlossary`, etc.) -- these are DD's own capability contracts, not Pimcore-version concerns.
- `class_exists` / `interface_exists` calls with dynamic class names (user-provided strings: `$itemClassId`, `$classId`, `$class`, `$brickContainerClassName`, etc.) -- runtime resolution probes, never version-compat.
- Optional-bundle probes (Dachcom Toolbox, Elements ProcessManager, V8Js, JSContext) -- the bundle integrates with these only when present.
- `function_exists('pcntl_*')`, `function_exists('gzopen')`, `extension_loaded('xdebug')` etc. -- PHP runtime extension probes, defensive across SAPI/OS, not Pimcore-version.
- `defined('PIMCORE_VERSION_DIRECTORY')`, `defined('PIMCORE_LOG_FILEOBJECT_DIRECTORY')`, `defined('PIMCORE_ASSET_DIRECTORY')` -- these constants are set by the host project's index.php / kernel boot, **not** by Pimcore core (zero hits in vendor source). The `defined()` guards are meaningful.
- `method_exists($fieldDefinition, 'setPathFormatterClass'/'enrichFieldDefinition'/'getClasses'/'enrichLayoutDefinition')` -- legitimate instance-polymorphism; only some `Data\*` subclasses implement these. `PathFormatterAwareInterface` declares only the getter, not the setter.
- `method_exists($layout, 'getChildren')` -- legitimate instance polymorphism (leaf field defs vs container layouts).
- `method_exists($object, 'getLocalizedFields')` / `getName` -- autogenerated only on concrete DataObject classes that have those features defined.
- `method_exists($e, 'getArgument'/'setArgument')` in event listeners -- defensive against event-class polymorphism.

Net effect: -63 lines, no behavior change on the Pimcore 12.3+ floor.

### Transitive dependency constraint audit

Tightened constraints on packages where the allowed lower bound was an EOL or pre-PHP-8.1 major that would never resolve under the Pimcore 11.5+/12 floor:

- `phpoffice/phpspreadsheet`: `1.*|2.*|3.*|4.*|5.*` → `^3.0 || ^4.0 || ^5.0`
- `wamania/php-stemmer`: `1.*|2.*|3.*` → `^3.0`
- `voku/portable-ascii`: `1.*|2.*` → `^2.0`
- `phpdocumentor/reflection-docblock`: `>=4` → `^5.6 || ^6.0` (matches Pimcore 12's own constraint)
- `endroid/qr-code`: `3.*|4.*|5.*|6.*` → `^5.0 || ^6.0`
- `ramsey/uuid`: `3.*|4.*` → `^4.7` (4.7.0 is the first release with `Uuid::uuid6()`, enabling deletion of the in-bundle `UuidGenerator` wrapper)
- `league/commonmark`: `1.*|2.*` → `^2.0`
- `avadim/fast-excel-reader`: `1.*|2.*` → `^2.0`
- Caret-normalized (semantically unchanged): `neitanod/forceutf8`, `deeplcom/deepl-php`, `halaxa/json-machine`, `mtdowling/jmespath.php`, `prewk/xml-string-streamer`, `voku/stop-words`, `jfcherng/php-diff`, `fidry/cpu-core-counter`, `dragonmantank/cron-expression`.

### Removed off-mission features

The Data Director mission is ETL for Pimcore (ingest → transform → load + export + REST). Two long-standing features that grew into the bundle without serving this mission were removed.

#### Adminer (database admin GUI)

Adminer was bundled because it filled a gap left by Pimcore Core. It has no relationship to data import/export.

- Deleted `Controller/AdminerController.php`, `lib/Pim/AdminerPlugins.php`.
- Removed three routes: `data_director_adminer`, `blackbit_datadirector_adminer_proxy`, `blackbit_datadirector_adminer_proxy_1`.
- Removed the `adminer` Pimcore-context branch from `EventListener/ContextListener.php`.
- Removed the system-menu hijack from `Resources/public/js/plugin.js` (the "Database Admin" entry under Extras → System Info).
- Removed the `/admin/(adminer|external)` rewrite from `nginx.conf`.
- Dropped composer deps: `vrana/adminer`, `phpmyadmin/sql-parser` (the latter had no other consumers in the bundle).

Existing installations: the `/admin/BlackbitDataDirectorBundle/adminer*` URLs will 404 after upgrade. If you relied on the Database Admin menu entry, install Adminer separately or use another DB client.

#### Web to Print (PDF document generation)

Web2Print was integrated via a `printpage` Pimcore document type, three "Data Director" AreaBricks (`dataDirectorWysiwygAreaBrick`, `dataDirectorImageAreaBrick`, `dataDirectorCodeAreaBrick`), a custom rendering controller, and two callback templates in the field-mapping UI. The integration depended on `\Pimcore\Bundle\WebToPrintBundle\Processor`, which was extracted from Pimcore Core into a separate optional bundle that is not part of the Data Director dependency closure -- meaning the entire integration was already non-functional in any environment that did not install Pimcore's Web2Print bundle separately.

- Deleted `Controller/Web2PrintController.php`, `lib/Pim/Web2PrintProcessor.php`, `templates/web2print/`.
- Deleted the three AreaBricks (`lib/Pim/Document/Areabrick/DataDirector{Wysiwyg,Image,Code}AreaBrick.php`) and their `Resources/views/Areas/dataDirector*AreaBrick/view.html.twig` templates. Their geometry was hardcoded to print-page units (millimeters with absolute positioning + paged-media polyfill) and they only ever worked inside the printpage document template.
- Removed the four matching service registrations from `Resources/config/services.yml`.
- Removed the two `pim.mapping.generate_pdf_from_document` and `pim.mapping.generate_pdf_from_html` callback templates from `Helper.php` (and their EN/DE/FR/IT translations).
- Deleted example dataports `examples/9-object-wizard/dataports/web2print-create-brochure.json` and `web2print-create-brochure-worker.json`.
- Collapsed the dead `Printpage`/`Printcontainer` branch in `lib/Pim/Item/FieldMapper/ElementPathMapper.php` (referenced `App\Controller\Web2printController::containerAction`, a user-side controller that never existed in the bundle; the parent Pimcore classes `Printpage`/`Printcontainer` no longer ship with Pimcore Core either).
- Migration `Version20250416095902` (which originally installed the `printpage` document type wired to `Web2PrintController`) is preserved as history. It uses `Web2PrintController::class` only as a compile-time string constant, so PHP does not autoload the deleted class.

Existing installations: any `printpage` Pimcore documents created by this bundle will still exist in the database but their controller route points at a now-deleted class. Operators should either delete those documents or, if PDF generation is still required, reinstate Pimcore's `pimcore/web-to-print-bundle` and rewire the documents to its controller.

Future direction: the genuinely interesting capability hidden inside the deleted AreaBricks -- letting users embed `$elements[0]`, `$elements[1]` placeholders in document content that are resolved at render time via Data Director's `replaceObjectIdentifier()` -- is not preserved here. If reintroduced, the natural shape would be DD-aware Twig functions or filters usable in any template, not printpage-specific AreaBricks.

#### Tutorial endpoint (`/BlackbitDataDirector/tutorial/`)

Despite the name, this endpoint was not a tutorial about Data Director. It served a single hardcoded HTML page (a search box + click counter) intended to demonstrate the bundle's REST API by calling two specific example dataports (`Headless App: Search Products`, `Headless App: Increase counter`). The page only worked if the operator had imported those exact example dataports first, and the template embedded a fixed API key from the demo environment.

- Deleted `Controller/TutorialController.php`, `templates/Tutorial/`.
- Removed route `blackbit_datadirector_tutorial_index` from `Resources/config/pimcore/routing.yml`.
- No menu entry, JS reference, or admin UI surface ever pointed at this URL -- it was only reachable by typing the path manually, and the only documentation of its existence was a single line in `examples/4-exports/Task.md` instructing developers following that example walkthrough to open `http://localhost:2000/BlackbitDataDirector/tutorial/`.

Existing installations: any bookmarks or external links to `/BlackbitDataDirector/tutorial/` will 404. No data migration is required.

Known follow-up: `examples/4-exports/Task.md` still references the removed URL. The wider examples/ directory belongs in the manual rather than shipped inside the bundle; that relocation is planned as a separate cleanup and will fix this dangling reference along with similar orphans.

### Removed back-compat wrappers

#### `lib/Pim/Mail.php`

This subclass of `\Pimcore\Mail` existed almost entirely to maintain the pre-Symfony-Mailer API names (`setSubject`, `setBodyHtml`, `setFrom`) after Pimcore Mail itself adopted the Symfony `Email` interface (`subject`, `html`, `from`). The remaining wrapper code consisted of a private duplicate of the parent's `renderParams()` method, a regex stripping `/cache-buster-12345/` path segments from `<link href>` URLs (a Pimcore asset-URL format that no longer exists in current Pimcore -- the regex matched nothing), and a single genuinely useful tweak: forcing `_force_allow_processing_unpublished_elements` on the document render so emails could render documents that an in-flight import had just created but not yet published.

- Deleted `lib/Pim/Mail.php`.
- Three call sites now use `\Pimcore\Mail` directly: `Maintenance/CleanupImportTrait.php`, `lib/Pim/Logger/EmailReportingLogger.php`, and the `pim.mapping.template.action.email` callback-template snippet in `lib/Pim/Helper.php`.
- Modern Symfony API at all call sites: `subject()` / `from()` / `html()` instead of `setSubject` / `setFrom` / `setBodyHtml`. Legacy `method_exists($mail, 'from')` fallback guards removed (Pimcore Mail has extended Symfony `Email` for years; the else-branch was unreachable).
- The `_force_allow_processing_unpublished_elements` behavior is preserved by setting it as a mail param (`$mail->setParam('_force_allow_processing_unpublished_elements', true)`) in the callback template -- this is the only call site that renders an email document via the import flow.
- The dead cache-buster regex was dropped (no URL format match in Pimcore 12; recoverable from git history if a path-based cache-buster ever returns).
- The Document-subject fallback that `getSubject()` used to provide is preserved by inlining a `$document instanceof Email && $document->getSubject()` check in the callback template's subject assignment.

Existing installations of the mapping callback template: previously-saved callbacks still reference `\Blackbit\DataDirectorBundle\lib\Pim\Mail` and will fatal at runtime after upgrade. Operators must update their saved callbacks to use `\Pimcore\Mail` (the in-UI template they can pick from has already been updated to the new form).

#### `Controller/MiscController.php`

A junk-drawer controller with three unrelated actions that shared nothing beyond not having a better home: a dynamically-generated CSS endpoint for DeepL flag icons, and two JSON endpoints reading bundle config parameters back from the DI container for frontend JS to consume via `async: false` (synchronous, UI-blocking) AJAX during plugin init.

- `translationLanguageIconsAction` -> moved to a dedicated `Controller/TranslationFlagIconsController::cssAction`. URL `/BlackbitDataDirector/translation-language-icons` is preserved so the bundle's `getCssPaths()` registration is unaffected.
- `readTranslationDetailsAction` and `readAjaxTimeoutFromConfigAction` -> deleted entirely. The two config values (`data_director.config.gui_translation`, `data_director.config.ajax_timeout`) are now served as a single JS file (`/BlackbitDataDirector/config.js`) by a new `Controller/ConfigController::jsAction` and loaded first in the bundle's JS path list. The frontend reads them synchronously off `window.blackbitDataDirector` -- no AJAX, no UI-thread blocking, no `async: false`.
- `Resources/public/js/plugin.js` and `Resources/public/js/ImportConfig.js` were simplified accordingly: ~45 lines of synchronous-AJAX helpers (`readGuiTranslationDetails`, `readAjaxTimeoutFromConfig`) deleted and replaced with one-liner `window.blackbitDataDirector?.*` reads.
- Cross-controller static coupling cleaned up: `MappingconfigController::getAutotranslateLanguages()` (the DeepL language list) was extracted into a dedicated `lib/Pim/Translate/AutotranslateLanguagesProvider` service. The hardcoded 29 language codes are now a class constant; the per-language current-user lookup is hoisted out of the loop. Both prior call sites inject the service.
- Routes removed from `Resources/config/pimcore/routing.yml`: `blackbit_datadirector_misc_gui_translation_details`, `blackbit_datadirector_misc_read_ajax_timeout_from_config`. Route key for the CSS endpoint renamed from `blackbit_datadirector_misc_translationlanguageicons` to `blackbit_datadirector_translation_flag_icons`. New route `blackbit_datadirector_config_js` added at `/BlackbitDataDirector/config.js`.

Existing installations: any external code that depends on the deleted JSON endpoints will need to read `window.blackbitDataDirector.{guiTranslation,ajaxTimeoutSeconds}` instead. The endpoints were not part of the bundle's documented API surface.

#### `EventListener/AssetRedirectListener.php`

A two-method listener on `pimcore.asset.preUpdate` / `pimcore.asset.postUpdate` that created a filesystem symlink at the old path of a renamed/moved asset, pointing at the new file location. The intent was URL stability: external systems (browser caches, search engines, embedded `<img>` tags on other sites) that still referenced the old asset URL would continue to resolve.

This is a general Pimcore quality-of-life feature that has no relationship to Data Director's import/export mission. The "asset got moved and old URLs still work" concern is something every Pimcore installation faces; bundling the feature inside DD was a category error.

- Deleted `EventListener/AssetRedirectListener.php` and its two `kernel.event_listener` tag entries in `Resources/config/services.yml`.

Existing installations: assets that were renamed while this listener was active retain their on-disk symlinks (the listener only creates them; it doesn't track or clean them up). The symlinks continue to work after this bundle stops creating new ones. No data migration required. If the feature is wanted long-term, it belongs in a standalone Pimcore bundle.

#### Auto-generated perspective customviews

The `pim.perspective.PIM` perspective was historically generated by a ~415-line `ClassChangedListener::createPerspective()` method that, on every Pimcore class create/update event (and from five migration call sites), iterated every `ClassDefinition`, computed the longest-common-path-prefix of its objects, built a per-group `customview` with full context-menu config, walked relation/localized/objectbrick/fieldcollection field definitions to track view dependencies, and persisted both `pim.perspective.default` and `pim.perspective.PIM` to disk.

That whole apparatus was admin-UX scope-creep -- it auto-arranged the Pimcore object tree by class group, which is something users routinely override with their own perspective configuration. The actual mission-relevant piece is the welcome dashboard's three Data Director portlets (`DataDirector_ErrorMonitor`, `DataDirector_TaggedElements`, `DataDirector_QueueMonitor`); those tell operators how their imports are going.

- `ClassChangedListener::createPerspective()` slimmed from ~415 lines to ~55. It now produces a static `pim.perspective.PIM` definition with a standard `documents` / `assets` / `objects` `elementTree` plus the three DD dashboard portlets. No per-class loop, no customview/dependency tracking, no `Listing` of class definitions, no DB queries to compute folder prefixes.
- `pim.perspective.default` is no longer created or modified -- DD only manages the perspective whose name starts with its own prefix.
- `saveCustomView()` helper (~45 lines) deleted -- only the removed customview loop ever called it.
- `updatePerspective()` method (a 4-line wrapper around `createPerspective()`) deleted -- it was referenced from nowhere.
- Event listeners on `pimcore.class.postAdd` and `pimcore.class.postUpdate` that called `createPerspective` removed from `Resources/config/services.yml`. The simplified perspective no longer depends on class state, so rebuilding it on every class change was pure overhead.
- Vestigial `use Pimcore\Perspective\Config;` imports removed from four migrations (`Version20230703153754`, `Version20230831115246`, `Version20240529172746`, `Version20250416095902`) that imported the class but never referenced it. The two migrations that actually call `createPerspective()` (`Version20230627221231`, `Version20230712085911`) keep working unchanged -- they invoke the now-slimmer function which produces the same `pim.perspective.PIM` shape minus the customviews.

Existing installations: an existing `pim.perspective.PIM` with the DD dashboard signature is left alone (the idempotency guard still recognises it as DD-managed). An existing `pim.perspective.default` written by the previous version is also left alone -- it's no longer in the set of perspectives DD manages, so the create-perspective logic will detect "user has custom perspectives" and exit without changes. Any per-class customviews previously written to `var/config/custom-views/` are not removed by this change; they are harmless leftovers that can be deleted manually if no longer wanted.

#### Auto-generated PIM perspective (full removal)

After the slim-down above, the remaining `createPerspective()` was a ~55-line method that wrote a static `pim.perspective.PIM` definition to disk with three Data Director welcome-dashboard portlets and a standard documents/assets/objects element tree. Closer inspection of the three portlets (`pimcore.layout.portlets.DataDirector_ErrorMonitor`, `DataDirector_TaggedElements`, `DataDirector_QueueMonitor`) confirmed they register themselves into the global `pimcore.layout.portlets.*` namespace at script load time and are available to every dashboard in every perspective -- the PIM perspective only seeded a convenient default layout, not the portlets' availability.

Auto-writing a Pimcore perspective file just to seed a default dashboard layout is invasive scope for a bundle. Users who want the DD portlets can drop them onto their own dashboard from Pimcore's portlet picker on any perspective they prefer.

- `ClassChangedListener::createPerspective()` deleted (~55 lines).
- `ClassChangedListener::savePerspective()` deleted (~45 lines) -- only the deleted createPerspective called it.
- Four now-orphan imports removed from `ClassChangedListener.php`: `RuntimeCache`, `LocationAwareConfigRepository`, `TagLogger`, `Pimcore\Perspective\Config`.
- Migration `Version20230627221231::up()` is now an empty body (its only operation was the perspective call); the `use ClassChangedListener;` import is removed. The `down()` body still uses `Listing` + `Pimcore\Perspective\Config` to clear custom-views, so those imports stay.
- Migration `Version20230712085911`'s up() and down() lose their `createPerspective()` calls; the `use ClassChangedListener;` import is removed; up()'s `Config::save([], ['Data Director'])` call is preserved (it clears a separate tag-related configuration, unrelated to perspectives).
- Translation keys `pim.perspective.PIM` and `pim.perspective.default` removed from all four locale files (en/de/fr/it).

The three Data Director dashboard portlets (`DataDirector_ErrorMonitor`, `DataDirector_TaggedElements`, `DataDirector_QueueMonitor`) remain registered and available across every Pimcore perspective. Users who relied on the PIM perspective's default dashboard layout can add the portlets to any dashboard via the standard "Add Portlet" picker.

Existing installations: any on-disk `pim.perspective.PIM` and `pim.perspective.default` YAML files in `var/config/perspectives/` will continue to be loaded by Pimcore (they are independent of the deleted PHP code). Operators who do not want them can delete the files. Any per-class customviews under `var/config/custom-views/` from earlier versions are similarly inert and can be deleted manually.

#### `EventListener/DataObjectTreeListener.php` + `lib/Pim/Tree/`

A `pimcore.admin.object.list.beforeListLoad` listener that swapped Pimcore's generic `DataObject\Listing` for a custom `TreeListing` whose DAO eager-loaded the `hasChildren` flag for every object in a single SQL `EXISTS` subquery, avoiding the N+1 `hasChildren()` queries Pimcore's admin tree otherwise issues when expanding a folder. A genuine performance optimization -- but for admin-UI tree navigation, not for any operation in Data Director's import/export pipeline. The listener guard skips `Listing\Concrete` and any listing with a `query` context, which is precisely the path imports and exports take.

This was admin-UX performance bundled into an ETL bundle. Same category mistake as the other off-mission items removed in this release.

- Deleted `EventListener/DataObjectTreeListener.php` (no callers anywhere).
- Deleted `lib/Pim/Tree/` directory: `ConcreteDao.php`, `FolderDao.php`, `TreeListing.php`, `TreeListing/Dao.php`.
- Removed the `kernel.event_listener` tag entry for `DataObjectTreeListener` from `Resources/config/services.yml`.

Existing installations: admin object-tree expansion reverts to Pimcore's default per-object `hasChildren()` query pattern. On installs with many objects per folder this may be slightly slower than before; if the optimization is wanted long-term it belongs in a standalone Pimcore performance bundle (or upstream in Pimcore Core, where every install would benefit equally).

#### `endroid/qr-code` composer dep + QR code mapping templates

The `endroid/qr-code` library backed two suggested mapping-UI callback templates -- one for Asset/Hotspotimage fields (generate a QR-code SVG asset on disk) and one for `Input` fields named `stream` (return the QR-code SVG as a string). Both shared the `pim.mapping.asset_generate_qrcode` translation key. The library was a hard `require` dep but no Data Director runtime code outside those two user-pickable templates depended on it. QR-code generation is not an ETL concern.

- Removed `"endroid/qr-code": "^5.0 || ^6.0"` from `composer.json` and regenerated the lock file. `composer show endroid/qr-code` is now empty; the `vendor/endroid/` directory is gone.
- Deleted the two QR-code `$templates[]` blocks from `lib/Pim/Helper.php` (one in the `Asset`/`Hotspotimage` field branch, one in the `Input`/`stream` field branch). Dead `use Endroid\QrCode\QrCode;` and `use Endroid\QrCode\Writer\SvgWriter;` imports removed -- they were only referenced inside the string templates as fully-qualified names, not in real Helper.php code.
- Collapsed the `if ($def->getName() === 'stream') {...} else {...}` structure in the `Input` branch to `if ($def->getName() !== 'stream')`. The `stream` branch previously only contained QR-code and (already-removed) Web2Print PDF templates -- after both removals it was empty.
- Translation key `pim.mapping.asset_generate_qrcode` removed from all four locale files (en/de/fr/it).
- Deleted example dataport `examples/7-import-plugin-comparison/qr-code.json` (its callback function was a copy of the same `Endroid\QrCode\*` snippet and would fatal at import time without the dep). The companion `Task.md` in that folder does not reference QR codes and is unaffected.

Existing installations: previously-saved mapping callbacks that used `\Endroid\QrCode\*` classes will fatal at runtime after upgrade with "Class not found". Operators who need QR-code generation can require `endroid/qr-code` directly in their project's `composer.json` -- the dropped templates were thin wrappers around the library's public API and are easy to reproduce in user callbacks if needed.

#### Dead composer deps: `php-science/textrank`, `nlgen/nlgen`

A grep across every PHP file in the bundle (and a `git log -S` across all branches and history) confirms that neither `PhpScience\TextRank\*` nor `NLGen\*` was ever referenced from any code in this bundle. The dependencies were speculatively added -- likely staging ground for a text-summarization feature (`textrank`) and a natural-language-generation feature (`nlgen`) that never shipped; the AI text-generation capability the manual actually describes ended up using DeepL and OpenAI-style integrations instead.

- Removed `"php-science/textrank": "1.*"` and `"nlgen/nlgen": "*"` from `composer.json` and regenerated the lock file.
- `vendor/php-science/` and `vendor/nlgen/` directories are gone.

Existing installations: no behavior change. These were dependency-graph noise, not features.

#### `lib/Pim/Item/Geo/Ellipsoid.php`

Vendored copy of `League\Geotools\Coordinate\Ellipsoid` deleted along with all consumer references. The class-level comment said it was vendored *"because league/geotools requires ext/bcmath in current versions, which is not installed on all systems. We only need the coordinate parsing logic from this library."* That rationale is obsolete -- `phpseclib/bcmath_compat` (already a hard require in `composer.json`) is a userland polyfill that loads `bc*` functions globally when ext/bcmath is missing.

Reachability audit confirmed the entire class graph was internally closed:

- Only `Ellipsoid::WGS84` and `Ellipsoid::createFromName()` had any callers. The single caller was `GeoCoordinate::__construct` initializing a `$this->ellipsoid` field that was then never read by anything in the parsing path (`setFromString`, `toDecimalDegrees`, `normalizeLatitude`, `normalizeLongitude`, `isEqual` all operate on lat/lon only).
- `GeoCoordinate::getEllipsoid()` had exactly one caller: `Ellipsoid::checkCoordinatesEllipsoid()`, which itself had zero callers and referenced an undefined `CoordinateInterface` (would have fatally errored on first call).
- The other 22 ellipsoid reference constants (AIRY, BESSEL_1841, KRASSOVSKY, ...) and the helper methods `getArithmeticMeanRadius`, `getInvF`, `getB`, `getA`, `getName`, `getAvailableEllipsoidNames` had no callers anywhere.

Changes:
- Deleted `lib/Pim/Item/Geo/Ellipsoid.php`.
- Removed the `$ellipsoid` field, the `?Ellipsoid $ellipsoid = null` constructor parameter, the `Ellipsoid::createFromName(Ellipsoid::WGS84)` initialization, and the `getEllipsoid()` accessor from `GeoCoordinate`. The class still parses geographic coordinate strings exactly the same way -- only the unused ellipsoid metadata field is gone.
- Removed the dead `use Blackbit\DataDirectorBundle\lib\Pim\Item\Geo\GeoCoordinate;` import from `Importer.php` (the symbol was imported but never used in the file).

Existing installations: no behavior change. The single actual consumer (`GeopointMapper.php`) only ever reads `getLatitude()` and `getLongitude()` from a `GeoCoordinate`, both of which still work identically.

#### `lib/Pim/Hooks.php`

A 2014-era extension interface (added in commit `28d5720cf`) declaring three hooks -- `shouldCreateItem()`, `shouldDeleteItem()`, `fieldsToTestForIsModified()` -- that Pimcore-4-era user bundles could implement by registering a `Website_Pim_Hooks_Helper` class. The Importer originally probed for that class via `class_exists("Website_Pim_Hooks_Helper") && in_array("Pim_Hooks", class_implements(...))` and dispatched to it during the import loop.

Pimcore 5 dropped the `Website_*` autoload namespace entirely, breaking the lookup mechanism. At some point during the Pimcore-5/10 migrations the dispatch wiring in `Importer.php` and the default no-op implementation `lib/Pim/Hooks/Helper.php` were both removed -- but the interface declaration was left behind. Searching the modern bundle for `shouldCreateItem` / `shouldDeleteItem` / `fieldsToTestForIsModified` returns hits only inside the interface declaration itself; nothing calls these methods.

Existing installations: no behavior change. The hook mechanism has been silently inert since at least the Pimcore 5 migration. The modern callback / `__should_create` / `__should_update` mapping fields are the supported way to gate object creation per record.

#### `lib/Pim/LocationAwareConfigRepository.php`

Orphaned subclass deleted. Introduced in November 2023 (commit `8385917ee`) for a single purpose: let `ClassChangedListener::createPerspective()` save the auto-generated PIM perspective YAML when `APP_ENV=prod` by overriding `isWriteable()` to bypass Pimcore's kernel-debug-mode guard. That perspective auto-generation was removed in full in `4f8290a7a` (see "Auto-generated PIM perspective (full removal)" above), leaving this helper with zero callers. Grep across the bundle confirms no remaining references; graphify confirms the only edges into the class were containment + its own method.

Existing installations: no behavior change. The class was unreachable code as of `4f8290a7a`.

### Bundle-loading fixes for the Pimcore 12.3 floor

Four bugs that prevented the bundle from loading or installing on a fresh Pimcore 12.3 install were missed during the compat-drop work. The 11.5-framing of the constraint masked them; the actual `^2025.4 || ^2026.0` floor is Pimcore 12.3+, and these are the four real holes.

#### Trait redeclaration in the ProcessManager compat shim

The optional `Elements\Bundle\ProcessManagerBundle\ExecutionTrait` integration was wired via a file-scope conditional in each of three Command files (`ImportPimCommand`, `ImportRawdataCommand`, `ImportCompleteCommand`). Each file declared the same local alias trait `Blackbit\DataDirectorBundle\Command\ProcessManagerExecutionTrait` at file scope. The guard checked whether the *upstream* trait existed but didn't guard against the *local alias* being redeclared when the next Command file was autoloaded -- "Cannot redeclare trait" fatal at command compile time.

Moved the trait definition into its own PSR-4-autoloaded file `Command/ProcessManagerExecutionTrait.php`. The autoloader resolves it exactly once, regardless of how many Command files reference it. The inline blocks in the three Command files are removed.

#### Dead Pimcore Migrations API in `Tools/Installer.php`

The Installer still referenced the pre-Doctrine-Migrations Pimcore Migrations API: `MigrationInstallerInterface`, `MigrationManager`, `Pimcore\Migrations\Configuration\Configuration`, `Pimcore\Migrations\Configuration\InstallConfiguration`, `Doctrine\DBAL\Migrations\Version`, `Doctrine\DBAL\Migrations\Migration`. Pimcore moved to `doctrine/migrations` proper years ago; all six symbols are gone in Pimcore 12.3. Cache warmup tried to autoload `MigrationInstallerInterface` from the `implements` clause and crashed.

- Removed `implements MigrationInstallerInterface` from the class declaration.
- Deleted the `$migrationManager` property and the second constructor parameter (DI was already passing only `$bundle`).
- Removed the always-false `if ($this->migrationManager !== null)` branches in `install()`, `allMigrationsExecuted()`, and `uninstall()` -- since the parameter was always null, those branches were dead.
- Deleted five methods that were either part of the removed interface or only callable from the dead branches: `getMigrationVersion()`, `migrateinstall()`, `migrateUninstall()`, `getMigrationConfiguration()`, `getInstallMigrationConfiguration()`.
- Removed seven dead `use` statements (the six missing symbols plus the now-orphaned `Doctrine\DBAL\Schema\Schema` that was only used by the deleted method signatures).

The actual install path -- shell out to `doctrine:migrations:migrate -n --prefix=...` -- is unchanged.

#### Stale `Pimcore\Perspective\Config` namespace in two migrations

`Migrations/Version20230712085911::up()` calls `Config::save([], ['Data Director'])` to clear perspective tags. `Migrations/Version20230627221231::down()` calls both `Pimcore\Perspective\Config::save(...)` and `Pimcore\CustomView\Config::save(...)`. In Pimcore 12.x both classes moved to the `Pimcore\Bundle\AdminBundle\` namespace (`Pimcore\Bundle\AdminBundle\Perspective\Config` and `Pimcore\Bundle\AdminBundle\CustomView\Config`).

Updated the imports / fully-qualified calls in both migrations. Also removed unused `use Pimcore\Model\DataObject\ClassDefinition\Listing;` from `Version20230712085911` (only the `down()` branch of `Version20230627221231` actually uses `Listing`).

#### Missing service registration for `AutotranslateLanguagesProvider`

The earlier extraction of `lib/Pim/Translate/AutotranslateLanguagesProvider` (in commit `5efe845b9`) introduced the new service but didn't add it to `Resources/config/services.yml`. The bundle's services.yml registers only the `Command/` directory via a `resource:` pattern import; everything else needs an explicit entry. `MappingconfigController` and `TranslationFlagIconsController` both autowire this dependency, so the container compile failed with "no such service exists".

Added `Blackbit\DataDirectorBundle\lib\Pim\Translate\AutotranslateLanguagesProvider: ~` next to the existing `TranslationProvider` entry (default autowire+autoconfigure inherited from `_defaults`).

Existing installations: with these four fixes in place, `bin/console pimcore:bundle:list` on a fresh Pimcore 12.3 install with the bundle enabled shows the bundle as Enabled + Installed and all migrations execute. Previously, the bundle could not be enabled at all because the kernel-compile phase crashed.

### Post-review fixes

A multi-agent review of the 4.0.0 work surfaced three P0 issues that the audit's own "verified" claims got wrong. Fixed here.

#### `composer.lock` removed from version control

Earlier audit commits (Adminer, Web2Print, endroid/qr-code, php-science/textrank, nlgen/nlgen removals) each claimed in the CHANGELOG that `composer.lock` was regenerated. They never were -- `git log -- composer.lock` across this branch showed zero touches. But the underlying assumption was also wrong: for a published library bundle, the lockfile is never consulted at install time. Consumers run `composer require blackbit/data-director` and resolve against *their* `composer.json` + `composer.lock`; the bundle's own lockfile is ignored. Committing it produced stale-security-advisory friction (deps pinned years ago that `roave/security-advisories` flags today), PR-diff noise on unrelated transitive drift, and a false sense that the lockfile pinned anything for consumers.

The three sibling Blackbit bundles (`BlackbitFormBuilderBundle`, `BlackbitS3AssetDecouplingBundle`, `BlackbitVisualPageBuilderBundle`) all already `.gitignore` their `composer.lock`. This bundle is now consistent with that convention.

- Uncommented the `composer.lock` line in `.gitignore` (the original `gitignore.io` template left both options visible; the library-lockfile choice was always the right one for this repo).
- `git rm --cached composer.lock` removes the file from version control; the working copy stays so developers running `composer install` in the bundle dir still get a working `vendor/`. CI / fresh clones regenerate the lockfile locally.
- The earlier "regenerated the lock file" / "`vendor/<x>/` directory is gone" claims in the Adminer/Web2Print/QR-code/textrank+nlgen sections are factually misleading. They were authored from an application mindset; for a library, the meaningful guarantee is the `composer.json` constraint, not the absent lock.

#### `phpmyadmin/sql-parser` restored to `require`

Commit `0743a3fd6` dropped `phpmyadmin/sql-parser` along with the Adminer integration, justifying the removal as "no other consumers in the bundle." That claim was false: `Controller/ImportconfigController.php` imports `PhpMyAdmin\SqlParser\Parser` (L92) and `PhpMyAdmin\SqlParser\Token` (L93) and uses them in `suggestCondition()` (route `/admin/BlackbitDataDirector/importconfig/suggest_condition`) at L2003 (`new Parser($sqlQuery)`) and L2029 (`new Token('', Token::TYPE_NONE)`). That action powers the SQL-condition autocomplete in the dataport-config UI. Once `composer.lock` is regenerated and the package actually gets removed from `vendor/`, hitting that endpoint fatals.

- Re-added `"phpmyadmin/sql-parser": "^5.0"` to `composer.json`.

This is independent of the Adminer removal — `vrana/adminer` was the actual Adminer dep and stays removed. `phpmyadmin/sql-parser` is a standalone SQL parser used by the bundle's own autocomplete feature.

#### Migration `Version20250416095902` neutralized

The migration's `up()` originally created a Pimcore `printpage` DocType wired to `Web2PrintController::class . '::pageAction'`. `Web2PrintController` was deleted in the Web2Print integration removal (commit `c3c40f577`). The earlier "preserved as history" CHANGELOG framing argued that the migration was safe because `Web2PrintController::class` resolves to a literal string at compile time and never triggers autoload — which is true at *migration* time, but irrelevant to the persistent side effect: the migration writes the broken FQN into the DocType table, and the next admin to select "Print Page" from Documents → Add Document hits `ControllerNotFoundException`.

- Both `up()` and `down()` now have empty bodies. The migration is preserved as a tombstone (kept in `doctrine_migration_versions` so the migration set stays monotonic) but performs no persistent writes.
- Dropped 5 dead `use` imports (`Controller\Web2PrintController`, `Controller\DocumentController`, `EventListener\ClassChangedListener`, `PimcoreDbRepository`, `ClassDefinition\Listing`, `Document\DocType`).
- Added a comment block at the file header explaining the no-op and pointing operators to the upgrade options (delete the DocType or reinstate `pimcore/web-to-print-bundle`).

Existing installs that already executed this migration retain their previously-created broken DocType. The CHANGELOG's existing Web2Print "Existing installations" note (delete or rewire) covers them. Fresh installs no longer create the broken DocType.

### Installer simplified: migrations are the pipeline's job

`Tools/Installer.php` rewritten from ~280 lines to ~80. The previous design ran migrations as a side effect of `isInstalled()` (which called `install()` inside a try/catch), shelled out to `doctrine:migrations:migrate` without a timeout or exit-code check, cached the result with a 24h TTL that didn't account for new releases, and used `debug_backtrace()` introspection in `canBeInstalled()` to break the isInstalled-calls-install cycle. None of that survives.

New shape:

- **`install()` does not run migrations.** It throws an `InstallationException` if the schema isn't applied, pointing the operator at `bin/console doctrine:migrations:migrate -n --prefix=Blackbit\\DataDirectorBundle`. In CD setups the deployment pipeline is expected to run migrations as part of the release process; bundle install becomes a state-verification step, not an action.
- **`isInstalled()` is a pure DB read.** It checks `Definition::getByKey('plugin_bb_pim')` -- the bundle's permission, created by an early migration, serves as the installed-state marker. No shell-outs, no autorun, no cache layer (Pimcore's own permission cache handles it).
- **`canBeInstalled()` is just `!$this->isInstalled()`.** The `debug_backtrace()`-based caller detection was only needed to break the isInstalled/install cycle and is no longer relevant.
- **`uninstall()` keeps dropping tables.** Asymmetric with install (which expects migrations to apply schema), but practical: running migration `down()`s to roll back five years of DataDirector schema is impractical; operators clicking "Uninstall" expect their tables gone, and a single-shot `DROP TABLE` is the consolidated cleanup path. The `migration_versions` registry is also cleared.

Removed:

- `allMigrationsExecuted()` helper (replaced by the trivial `isInstalled()` check).
- The `Cli::exec('doctrine:migrations:migrate ...')` shell-out and surrounding lock/release dance in `install()`.
- The pre-Pimcore-11 `INSERT IGNORE INTO migration_versions ... FROM pimcore_migrations WHERE migration_set=?` bridge. The `pimcore_migrations` table doesn't exist on the Pimcore 12.3 floor; the `INSERT ... SELECT` was already failing silently inside a try/catch and produced nothing useful.
- `executeMigrationsUp()` composer-script handler -- had no callers anywhere (no entry in `composer.json` scripts; zero references in the codebase).
- `INSTALL_LOCK_KEY` constant, `LockableTrait` use, and the lock acquire/release inside `install()`. Without the in-method migration run there is nothing to serialize.
- 7 dead `use` imports: `Cli`, `LockableTrait`, `Composer\Script\Event`, `Db`, `BlackbitDataDirectorBundle`, `Exception`, `PhpExecutableFinder`, `Process`.

Kept unchanged:

- The four memoized `get*Path()` directory helpers.
- `isInMaintenanceMode()`.
- All `TABLE_*` constants.
- `needsReloadAfterInstall()`.

Existing installations: the admin UI "Install" button now requires that migrations have already run. Operators upgrading from a previous Data Director version where the installer auto-ran migrations need to run `bin/console doctrine:migrations:migrate -n --prefix=Blackbit\\DataDirectorBundle` before clicking Install (or as part of their deployment pipeline). The `bin/console pimcore:bundle:install BlackbitDataDirectorBundle` CLI path is equivalent. Reasoning is operator-facing in the thrown `InstallationException` message.

### Performance

#### Memoize `Installer::get*Path()` directory checks

`Installer::getConfigPath()`, `getConfigVersionPath()`, `getCachePath()` and `getResultDocumentPath()` ran an `is_dir()` + lazy `mkdir()` check on every call. These methods are invoked from hot paths -- every `BackingUpResponse` construction, every parser intermediate-file path, every uploaded file. On installs where the bundle's `var/` subtrees are mounted on a shared filesystem (NFS, CephFS, EFS), each `is_dir()` is a metadata-server round-trip.

Each method now caches the resolved path in a `static` local on first call, so subsequent calls return without touching the filesystem.

Existing installations: no behavior change. If the directory is deleted out from under a running PHP process the first writer will fail at `fopen` time -- the prior implementation would have silently recreated it. This is not a regression for in-process operation (DD code never deletes these directories) but is a theoretical concern for external cleanup scripts that wipe `var/log/BlackbitDataDirector` while DD is running.

### Additional cleanups and breaking-change caveats

Surfaced by the multi-agent review of the 4.0.0 work. Each item here is a small cleanup or a public-surface caveat that the earlier sections didn't call out explicitly.

#### Cleanups

- **`EventListener/ImportStatusListener` deleted.** It was a Pimcore-5-era event listener registering an `importCleanupLegacy` maintenance job via the `pimcore.system.maintenance` event tag. `Maintenance/CleanupImportStatus` already registers the identical cleanup via the modern `pimcore.maintenance.task` service tag, so both ran on every maintenance tick -- duplicate work. The legacy listener is gone; the modern path stays. The services.yml entry is removed too.
- **`lib/Pim/Compat/ProcessManager/Configuration.php` and `Configuration/Listing.php` deleted.** Both shims had zero consumers (verified by grep); only the sibling `ExecutionTrait` and `MonitoringItem` shims under the same directory are wired. The deleted shims were never reachable.
- **`rename-to-data-director.php` deleted.** Pimcore-5/6-era one-shot script that renamed `Blackbit\PimBundle\BlackbitPimBundle` → `BlackbitDataDirectorBundle`. Used `Pimcore\Extension\Config` (gone in Pimcore 11) and `pimcore:migration:migrate` (renamed in Pimcore 10+). Not callable on the 12.3 floor.
- **`Symfony\Component\Lock\Factory` fallback branches removed** at three sites (`lib/Pim/LockableTrait.php`, `Maintenance/CleanupImportTrait.php`, `Controller/ImportController.php`). The fallback was a `try { container->get(LockFactory::class) } catch { new Symfony\Component\Lock\Factory(new FlockStore(...)) }` -- `Symfony\Component\Lock\Factory` was removed in Symfony 6.0, so on the Pimcore 12.3 floor the catch is worse than no fallback (would fatal if reached). `LockFactory` is a standard autowired service in any Symfony 6 app; the catch was unreachable. Four orphaned `use Symfony\Component\Lock\Store\FlockStore;` imports cleaned up.
- **`Tools/Installer::executeMigrationsUp()` composer-script handler deleted.** No `composer.json scripts` entry pointed at it; grepping the bundle returned only the method declaration. The method shelled out to `pimcore:bundle:install` which is what `install()` already does.
- **`BlackbitDataDirector|BlackbitPim` route requirements collapsed to `BlackbitDataDirector`** at 8+ sites in routing.yml, config.yml, and the four controllers. `BlackbitPim` was the pre-2019 bundle name; any operator reaching Pimcore 12.3 has long since migrated, and the dual-name matcher only existed for URLs bookmarked from the pre-2019 bundle.
- **Stale "Pimcore 5/6 BC" comments cleaned up.** `lib/Pim/Item/Importer.php` L6281-6287 had a `method_exists($lock, 'setUser')` branch with a `// BC Pimcore 5` else-arm calling `$lock->setUser(User::getById(0))`. Pimcore 12.3's `Editlock` no longer has `setUser()`, so the else-arm was unreachable; the method collapses to `$lock->setUserId(0)`. Parser comments at `FilesystemParser.php:422` and `ResourceBasedParser.php:1230` claiming "Pimcore 6 compatibility: locks.id is varchar(150)" were misleading -- the substr truncation is just a length safety against a still-current schema, reworded.
- **`EventListener/ContextListener::onKernelRequest` phpdoc cleaned up.** Was typed as `RequestEvent|\Symfony\Component\HttpKernel\Event\GetResponseEvent` — `GetResponseEvent` was removed in Symfony 5.0. Simplified to a real `RequestEvent` parameter typehint with `void` return.
- **`GeoCoordinate::isEqual()` deleted** (with its companion `use League\Geotools\Coordinate;` import). The method took a `League\Geotools\Coordinate` parameter, but `league/geotools` is not in `composer.json` -- the first call would have fataled on autoload. Zero callers across the bundle. Item #7 on the deferred-followups plan; cleared here.
- **`examples/9-object-wizard/Task.md`** had a step instructing the reader to create a Web2Print brochure dataport via the object wizard. The companion JSON files were deleted in `c3c40f577` (Web2Print integration removal); the step is removed.
- **Orphan `use` imports** swept across 41 files: ~333 import statements with zero remaining references in the file body. Each verified by counting occurrences of the imported short-name in the file outside the `use` line itself. No semantic changes.

#### Public-surface breaking changes worth flagging explicitly

The earlier per-section "Existing installations:" notes covered the major user-facing breakages (Adminer URLs 404, Web2Print DocType orphan controller, `\Blackbit\DataDirectorBundle\lib\Pim\Mail` and `\Endroid\QrCode\*` callback fatals, dropped JSON config endpoints). The multi-agent review surfaced several additional public-surface changes that weren't called out by name. Operators with custom integrations should audit for:

- **`MappingconfigController::getAutotranslateLanguages()` deleted.** Was a `public static` method returning the DeepL language code list. Replaced by the `AutotranslateLanguagesProvider` service. Any external code calling the static directly will get "Call to undefined method". Recommended replacement: inject `Blackbit\DataDirectorBundle\lib\Pim\Translate\AutotranslateLanguagesProvider` and call `getLanguages()`.
- **`Tools/Installer` constructor signature narrowed** from `__construct(BundleInterface $bundle, ?MigrationManager $migrationManager = null)` to `__construct(BundleInterface $bundle)`. DI was already only passing `$bundle`, but anyone overriding the `Blackbit\DataDirectorBundle\Tools\Installer` service with an explicit argument list breaks. Same for manual `new Installer(...)` invocations (none expected, but flagging).
- **`Tools/Installer` no longer implements `MigrationInstallerInterface`.** That interface was removed from Pimcore 12 anyway, so any downstream code typing against it was already broken on the floor. Flagged for completeness.
- **Pimcore document-type service IDs `data-director.area.dataDirectorWysiwygAreaBrick` / `dataDirectorImageAreaBrick` / `dataDirectorCodeAreaBrick` removed.** Any Twig template containing `{% pimcore_areablock 'content' allowed=['dataDirectorWysiwygAreaBrick', ...] %}` will fail at render time when Pimcore can't resolve the brick key. Existing printpage documents containing those brick instances will also fail. Either remove the brick references from templates, delete the affected documents, or reinstate `pimcore/web-to-print-bundle` and rewire.
- **Route key rename `blackbit_datadirector_misc_translationlanguageicons` → `blackbit_datadirector_translation_flag_icons`.** The URL (`/BlackbitDataDirector/translation-language-icons`) is preserved, so static `<link href="...">` references keep working. But any code generating the URL via `$router->generate('blackbit_datadirector_misc_translationlanguageicons')` or Twig `{{ path('blackbit_datadirector_misc_translationlanguageicons') }}` throws `RouteNotFoundException`. Update the route name to `blackbit_datadirector_translation_flag_icons`.
- **`window.blackbitDataDirector.guiTranslation` shape on empty config:** the replacement JS-served config emits `{}` (object) where the deleted MiscController JSON endpoint emitted `[]` (array). External JS doing `Array.isArray(window.blackbitDataDirector.guiTranslation)` now sees an object. The bundle's own JS uses the values directly so it's tolerant; only external code is affected.
- **Deleted PHP classes** that were public surface but not previously flagged by name (in addition to `\Blackbit\DataDirectorBundle\lib\Pim\Mail` and the `\Endroid\QrCode\*` consumers already called out): `\Blackbit\DataDirectorBundle\lib\Pim\Web2PrintProcessor`, `\Blackbit\DataDirectorBundle\lib\Pim\AdminerPlugins`, `\Blackbit\DataDirectorBundle\lib\Pim\Hooks` (extension interface), `\Blackbit\DataDirectorBundle\lib\Pim\LocationAwareConfigRepository`, `\Blackbit\DataDirectorBundle\lib\Pim\Item\Geo\Ellipsoid`. Any operator-written mapping callbacks, service overrides, or extension classes referencing these will fatal at runtime. Most have very narrow user-extension surface but the Web2PrintProcessor case is worth auditing for if Web2Print integration was previously customized.

#### Parser per-file import lock keys: bounded-length pattern + matching release

**Honest framing:** these are code-hygiene cleanups. Neither was producing a runtime regression in DD's current fork-per-import deployment model, because every PHP process that acquires a file-import lock also has bounded lifetime, and `LockableTrait::lock()` registers a `register_shutdown_function` + pcntl signal handlers (SIGINT/SIGTERM/SIGHUP) that release all of `self::$locks` at process exit. Even the canonical K8s deployment shape (long-lived `bash` wrapper looping over fresh `data-director:process-queue` PHP processes, each spawning short-lived `data-director:complete <id>` child processes per queue item) clears locks correctly via that shutdown hook on every PHP-process exit.

What the cleanups change:

1. **Lock-key construction was sloppy.** Both parsers built the key as `md5($file).'-import-'.dataportId.'-'.$file` then truncated to 150 chars. `$file` appeared twice -- once as md5, once as the raw, then-truncated suffix. Uniqueness was carried entirely by the md5 prefix; the raw suffix was dead weight that the truncation chewed up. New shape via a `importLockKey()` helper in each file:

   ```php
   'dd-import-'.$dataportId.'-'.md5($file)
   ```

   ~52 chars worst case, single hash, no truncation, debug-readable prefix.

2. **`FilesystemParser::current()` released with a different key shape than the acquire** (`'import-'.dataportId.'-'.$fileInfo->getPathname()` -- no md5, different separator). The explicit release was a no-op against the lock that `getFileIfNotLocked()` had acquired. In practice the lock got released anyway at process exit; the explicit release was *redundant* rather than load-bearing. Two sites in `current()` now use the same `importLockKey()` helper so the explicit per-file release actually matches the acquire.

#### Locks: clean acquire-failure path + parser-level explicit release

Two follow-up fixes on the same theme -- both code-hygiene improvements rather than fixes for observed production regressions.

1. **`LockableTrait::lock()`: don't cache an unacquired Lock.** The previous flow assigned `self::$locks[$name] = $lockFactory->createLock(...)` *before* calling `acquire()`. If `acquire()` returned false, the function returned false but left a dangling Lock object in `self::$locks[$name]`. Subsequent `lock()` calls with the same name then hit the `isset(self::$locks[$name])` branch and called `isExpired()` on a Lock that was never acquired -- undefined behavior in some Symfony lock stores. Reachable in any deployment when two consumers race for the same lock and the loser tries again with the same name in the same process. The assignment now happens *after* successful acquire.

2. **`ResourceBasedParser`: explicit release on file switch + destruction.** The trait acquired per-file locks but never released them explicitly -- it relied on the `LockableTrait::lock()` shutdown hook. For DD's fork-per-import process model the shutdown hook handled every case: each parser instance lives in a child PHP process whose exit releases its `self::$locks` entries. The explicit release adds defensive cleanup for two paths the shutdown hook covered slowly or not at all:
    - **`setSourceFile()` retargeting within one process:** a parser reused across multiple source files held every previous file's lock in `self::$locks` until process exit. Setter now releases the prior `$this->lockKey` before switching.
    - **Future long-lived workers (FrankenPHP, Roadrunner, Pimcore Messenger consumers).** DD's current deployment model doesn't run parsers in long-lived workers -- the queue processor spawns separate child PHP processes per dataport run via `Symfony\Component\Process\Process` -- but if that ever changes, locks would have accumulated until worker recycle. A new `__destruct()` iterates `$this->lockKeys` and releases each so the trait no longer relies on the shutdown hook for normal cleanup.

What the shutdown hook still covers, with or without these fixes:

- Normal `exit()`, `die()`, and fatal-error paths.
- SIGINT, SIGTERM, SIGHUP (the K8s `preStop` path that sends SIGTERM to the queue processor PID).

What nothing in the bundle covers, with or without these fixes:

- SIGKILL (K8s OOM kill, `kill -9`, node-level eviction). The Lock store keeps the entry until the 4h TTL elapses. A shorter TTL or a Redis lock with auto-extending heartbeat would shrink this window -- that's listed in `.context/plans/2026-05-19-data-director-deferred-followups.md` item #5.

#### `DebugClassLoader::disable()` removed from 5 bulk-import entry points

Five hot-path methods opened with `Symfony\Component\ErrorHandler\DebugClassLoader::disable()`:

- `lib/Pim/Item/Importmanager.php::doImport()`
- `lib/Pim/RawData/Importmanager.php::import()`
- `lib/Pim/Helper.php::createFieldMappings()` and `createMapping()`
- `Controller/ImportconfigController.php::getDemoDataAction()`

Introduced in 2023 (`4e64b2b1`, `47a5fe15`, `e0a94675`, `5607289c`) with commit messages framing it as "use less memory for big imports." The 2023 reasoning was reasonable in dev: `DebugClassLoader` wraps the Composer autoloader to run reflection-based deprecation + case-sensitivity checks on every class load, and a big import autoloads thousands of object/field/callback classes.

In production it was always dead code. `Debug::enable()` (the only call that registers `DebugClassLoader`) is gated on `APP_DEBUG=1` at `vendor/pimcore/pimcore/lib/Bootstrap.php:235-239`. With `APP_DEBUG=0` (the prod default for every Pimcore deployment) the class loader is never registered, so `DebugClassLoader::disable()` finds nothing to unregister and silently no-ops.

In dev mode it was actively user-hostile: a developer running an import would have deprecation notices silenced for the rest of the request -- contrary to what dev mode is for. The notices the developer was supposed to see during DD work are exactly what `DebugClassLoader` would have surfaced.

All 5 call sites and their `use Symfony\Component\ErrorHandler\DebugClassLoader;` imports are deleted. The neighboring `setSQLLogger(null)`, `profiler->disable()`, `Cache::disable()` and `\Doctrine\Deprecations\Deprecation::disable()` calls stay -- those services *are* active in prod and the disables are load-bearing on bulk paths.

Existing installations: no behavior change in production. In dev, big imports will now emit Symfony deprecation notices for any deprecated class autoload during the import (per the standard `APP_DEBUG=1` contract). If those notices are noisy enough to be a problem, the right answer is to fix the deprecated calls, not to re-silence them.

#### Status-URL apikey: three inline lookups consolidated to the self-healing helper

After the Pimcore-11 compat cleanup (`f50e29039`) removed the `$user->getApiKey()` first-link of the API-key fallback chain, three sites were left doing only the DD `plugin_pim_api_keys` table lookup with no auto-issue fallback:

- `Controller/ImportController.php:827-830` (admin UI: import + result-callback-with-output flow)
- `Controller/ImportController.php:946-949` (admin UI: process + result-callback flow)
- `Controller/RestController.php:809-811` (Swagger doc generation; `default` value for the `apikey` query parameter)

When the lookup returned empty (user never issued a DD API key, or row exists but `valid_to < NOW()`), the surrounding `if ($apiKey) { $statusUrlParams['apikey'] = $apiKey; }` block was skipped and the status URL the admin UI presented had no apikey. The user got a "import started, monitor here" notification with a link that produced 401/403 when clicked. Silent UX corruption — the import itself ran fine via the queue path, only the monitoring link broke.

The bundle already had a self-healing helper at `Controller/RestController::getApiKeyForCurrentUser()` (L1192) that does the same SELECT and falls through to `ApiKeys::createOrUpdate(...)` when no row exists. That helper was already called from the dependent-dataport callback template at `lib/Pim/Helper.php:2827`, so "any admin user implicitly may issue their own DD API key" is the established precedent in this codebase. The three inline lookups now call that helper instead.

Authorization check (performed before consolidating): DD does not register a separate "may issue API keys" permission. The admin UI for managing API keys (`ImportconfigController::restAuthAction`) lets any authenticated admin user manage their own row (the `users` permission only gates seeing *other* users' rows). The status URLs are reached only behind Pimcore's admin firewall, where `Tool\Admin::getCurrentUser()` is guaranteed to be the same admin user. Extending the helper to three more sites is consistent with that policy; it does not introduce a privilege escalation.

Existing installations: imports launched by admin users who lacked a DD API key row will now silently get one auto-issued on first import (md5 of uniqid, no expiry). Previously the same flow produced a broken monitoring link.

Residual bug not closed here: the helper at L1196-1212 only auto-issues when **no row exists at all**. If a row exists but `valid_to` has lapsed, the helper returns null and the broken-link symptom returns for that user. Closing this requires either (a) extending the helper's renewal condition to also fire on `valid_to < NOW()`, which changes the semantics of "deliberately revoked by setting valid_to to a past timestamp," or (b) surfacing a clear "your DD API key expired -- renew it under Settings > Data Director" error path. Either is a small follow-up; not bundled here to avoid changing deliberate-revocation semantics by stealth.

#### Security: `restAuthUpdateAction` write authorization (privilege escalation fix)

`ImportconfigController::restAuthUpdateAction` (POST `/admin/{bundle}/importconfig/rest-auth/update`) is the write side of the rest-auth admin grid -- the ExtJS panel under the dataport tree's *Permissions & API Keys* button uses it to create and update API-key rows in `plugin_pim_api_keys`.

The read endpoint (`restAuthAction`, L3389-L3399) enforces "you can see other users' rows only if you have the Pimcore `users` permission; otherwise you only see your own row." The write endpoint did not enforce the symmetric predicate. A non-`users`-permission admin authenticated at the Pimcore admin firewall could direct-POST to the endpoint with any `users_id` and `api_key`, since the controller blindly wrote whatever the request body contained:

- **Create attack**: POST `{"permission_id": 0, "users_id": <victim_id>, "api_key": "x", "valid_to": null}` → creates a new key bound to the victim user. The attacker then calls the DD REST API with `?apikey=x` and `RestApiAuthenticator` resolves them as the victim, granting access to the victim's full dataport ACL.
- **Update/reassign attack**: brute-force `permission_id` values (sequential auto-increment ids) and POST `{"permission_id": <victim_row_id>, "users_id": <self_id>, "api_key": <known>, ...}` → rebinds an existing victim row to the attacker, OR overwrites the victim's `api_key` value with a known string and then authenticates as the victim.

The write endpoint now applies the same predicate as the read endpoint:

```php
$adminUser = Tool\Admin::getCurrentUser();
if (!$adminUser->isAllowed('users')) {
    if ($targetUserId !== $adminUser->getId()) {
        throw new AccessDeniedHttpException();
    }
    if ($permissionId !== 0) {
        $existing = $apiKeyListing->findOne(['id = ?' => $permissionId]);
        if (!$existing || (int)$existing['users_id'] !== $adminUser->getId()) {
            throw new AccessDeniedHttpException();
        }
    }
}
```

Two checks: the body's `users_id` must equal the caller, AND when updating an existing row the row's stored `users_id` must also equal the caller. The first blocks create-for-other-user; the second blocks update-reassignment-of-other-user's-row. Admins with the Pimcore `users` permission continue to bypass both (they are by design allowed to manage all users' API keys, matching the read endpoint).

Operator-chosen `api_key` strings remain accepted on the write side. The grid exposes the API key as an editable text field, so operators relying on predictable keys (CI/staging fixtures, integration test setups) keep working. Random keys are still the default when issued via `RestController::getApiKeyForCurrentUser()`. Tightening this further (server-generated keys only, never client-proposed) is a deliberate UX-affecting decision and is left as a future option.

Existing installations: legitimate users see no behavior change -- the grid UI was already filtering to self-rows for non-`users` admins. Only direct REST/curl attempts to bypass the filter now fail with 403 instead of silently writing into the database.

#### CSV import: same file imported over and over, progress total far above the file's row count

Symptom from a production run: the progress log of a CSV dataport climbed to `320000 / 342952 (93%)` for a source file that holds 20000 records. Two independent defects add up to that line.

1. **The single asset was re-served on every EOF.** `CsvParser::gotoNextImportResource()` archives the current file and asks `setSourceFile()`/`getFileOrUrl()` for the next one -- the mechanism that lets one dataport drain a whole folder. Literal file paths, URLs, FTP single files and the two local `GlobIterator` branches already refuse to hand out a resource twice per parser instance (`SingleFileImportGuard`), but the two *asset* branches did not:
    - the Pimcore >= 10 asset-storage branch, which falls back to `getFileIfNotLocked($asset->getRealFullPath())` when the Flysystem listing yields nothing (i.e. the source is one asset, not an asset folder). Each pass copied the asset to a fresh temporary file and re-imported all of its rows. The per-file lock does not stop this: `setSourceFile()` releases it before re-resolving.
    - the `PIMCORE_ASSET_DIRECTORY` glob branch, when the pattern resolves to a single always-present asset.

   Both now consult the same guard, and the asset-storage branch returns `null` outright once the asset has been served -- falling through would let the remaining branches fetch the same asset over HTTP or write its path into a temp file as if it were inline import content. `$done` therefore stops at one full pass over the file (in the report above it had already made 16 passes: 16 × 20000 = 320000).

2. **`CsvParser::count()` counted physical lines, not CSV records.** It seeked an `SplFileObject` to EOF and used `key() + 1`, so a quoted field containing line breaks contributed one item per line, and a trailing newline added one more on top. Iteration, by contrast, yields `fgetcsv()` records -- the total could never be reached (22952 counted vs. 20000 importable in the report above). Counting now runs `fgetcsv()` with the dataport's configured separator and quote character over the file, i.e. exactly what the iteration does. Covered by `tests/Lib/Pim/Parser/CsvParserRecordCountTest.php`.

`FixedLengthFileParser::count()` had the same trailing-newline off-by-one -- `SplFileObject::key() + 1` counts the phantom empty line behind a file's final line break, one row more than `current()` ever yields via `fgets()`. It now counts with `fgets()` as well. Covered by `tests/Lib/Pim/Parser/FixedLengthFileParserLineCountTest.php`.

#### Mapping: a `localizedfields` row instead of one row per language

The Mapping tab listed a target class's `localizedfields` container as a single mappable row of type `localizedfields`. That row can never do anything: the execution engine writes a localized value from a `(fieldName, locale)` pair — the `plugin_pim_fieldmapping` primary key — and a container carries no value of its own. Classic expands it (`Helper::handleDefinitionElement`) into one mapping per child field per valid language; the Studio read path never did, and the save path hard-coded `locale => ''` on every row it wrote, so no localized mapping could be expressed at all.

- `MappingConfigService` now expands a `Localizedfields` definition into one row per (child field x valid language) — child-major, so a field's languages sit together — each carrying the child's own name and field type plus its `locale`. The container is no longer a row. Existing mapping rows are matched per `(fieldName, locale)`; keying by name alone collapsed a field's languages onto whichever row the query returned last.
- `MappingField` gained `locale` (`''` for every ordinary field) and a `key()` — `name` or `name#en` — that is classic's `attributeKey`. This was already the identifier the preview engine returns its per-field results under (`LegacyHelperPreviewProvider` splits the `#locale` suffix and resolves the child definition inside the container), so localized preview values had been computed all along with no grid row to land on. They line up now.
- `MappingSaveService` writes the row's `locale` through, and its delete-then-reinsert scope now names the localized **child** fields — scoping by the container alone would have left every previously saved localized mapping behind and duplicated it on the next save. The container name stays in that scope to clean up the bogus single `localizedfields` row a pre-expansion grid could have persisted.
- `LegacyHelperTemplateProvider` and `MetaColumnsService` descend into the container to resolve a localized child by name, so a localized row offers callback templates and (for an advancedManyToManyObjectRelation) meta columns like any other.
- Frontend: rows are keyed by `mappingFieldKey` (`name#en`) rather than the bare field name — staged edits, the settings modal, preview lookups and `rowKey` all agree on it. Searching matches the key too, so `name#de` finds one specific language.
- Each language of a localized field is marked in the grid with Pimcore's own flag icon plus the upper-cased code (`name` 🇬🇧 `(EN)`) — the flag makes the rows scannable, the code keeps them unambiguous where several languages share a flag. Flag URLs come from the backend (`languageFlags` on the mapping config response, resolved through `Tool::getLanguageFlagFile()`) rather than a language-to-country table duplicated in the frontend. Both that resolver and the SVGs it points at ship with `pimcore/admin-ui-classic-bundle`, so `LanguageFlagIconsLoader` checks the class exists and the icon is actually published before emitting a URL: a Studio-only installation, an unpublished asset directory, or a language Pimcore has no flag for all degrade to the language code alone rather than failing the Mapping tab or requesting an image that 404s. The settings modal titles a localized row `name (EN)` for the same reason.

Not covered: localized fields nested inside an object brick or a classification store still surface as one sub-field row; expanding those needs the nested loaders to return field definitions rather than name/type pairs. With no valid languages configured a localizedfields container now contributes no rows at all (classic behaves the same) — Pimcore cannot store localized data in that state anyway.

#### Studio installations: two crashes from code that assumes the classic admin bundle

`pimcore/admin-ui-classic-bundle` is optional on the Pimcore 12 floor, and an installation without it hit two unrelated fatals.

**Backend deeplinks now point at Studio.** `EmailReportingLogger::log()` and the `deeplink` data-query selector each built the classic admin's `pimcore_admin_login_deeplink` URL inline. That route ships with the classic admin bundle, so on a Studio installation the router threw `RouteNotFoundException` — in the logger's case *from inside `log()`*, and because the mapper logs errors from within its own `catch`, the routing exception replaced the error being reported and aborted the field's mapping. The visible symptom was `Error while mapping value of field "images": … Route 'pimcore_admin_login_deeplink' not found`, with the real cause nowhere in sight.

Both now go through one `ElementDeeplinkGenerator`, which builds Studio's own deeplink route — `{url_path}/{elementType}/{id}`, e.g. `https://host/pimcore-studio/data-object/42`. Opening it boots the SPA, which routes through its `DeepLink` component and opens the element. Two details the route dictates: a data object is spelled `data-object`, not Pimcore's own `object` (the segment reaches Studio's `openElement()` verbatim), and the id must match `\d+`, so an unsaved element gets no link. The path prefix is read from the `pimcore_studio_ui.url_path` parameter — the same one Studio's routing and app config use — rather than hard-coded, so a relocated Studio stays linkable; the route is built from that parameter rather than generated by name because its four `#[Route]` attributes share one action and so carry auto-generated, order-dependent names. When no link can be produced the element is reported by path, unlinked. Covered by `tests/Infrastructure/Element/ElementDeeplinkGeneratorTest.php`.

**Assets on remote storage could never be saved.** `AbstractFieldMapper::getAsset()` took a checksum before saving, guarded with `catch (UnableToProvideChecksum)` — a Flysystem exception that `Importer::getAssetChecksum()` never throws. What it does throw for a non-local stream is `InvalidArgumentException('Checksum can only be calculated for local assets')`, which escaped the guard, skipped `$asset->save()` entirely and was reported as `Could not save asset "…"`. So on installations using remote asset storage, no asset the image/asset mappers touched was ever written. The checksum is bookkeeping for the update log's "old → new" line, so it now degrades to "no checksum" (`n/a` in that log line) via a shared `assetChecksumOrNull()` helper, used for the post-save checksum too — that one ran *after* a successful save and could turn it into a spurious "could not save" error. Covered by `tests/Lib/Pim/Item/FieldMapper/AssetChecksumFallbackTest.php`.

The other `getAssetChecksum()` call sites were checked and are already inside `\Throwable`/`\Exception` handlers (`ImageGalleryMapper`'s recognition callbacks, `Importer::isEqual()`, `Importer::getLogOutput()`).

#### Mapping/Configuration: the classic "Asset target folder" setting was missing

`targetconfig.assetFolder` — labelled *Asset target folder* in classic (`pim.dataport_assetfolder`) — had no editor in the Studio Configuration tab. It was still in `DataportUpdateService::TARGETCONFIG_DEFAULTS`, so existing dataports kept whatever value they had and new ones got `/`, but nobody could see or change it.

It matters in two ways, and the second was the worse gap:

- On any import, it is where assets created from a mapping are placed (`Importer::getAssetFolder()`), e.g. an image field resolving a URL.
- For an **Asset** target class it is the target folder itself: `Importer::getItemFolder()` reads `assetFolder`, not `itemFolder`, when the item mold is an Asset. The editor hides the ordinary "Target folder" field for asset targets precisely because of that (`showItemFolder = !isExport && !isAsset`) — so an asset dataport had no way to choose a target folder at all, silently importing into whatever was already stored.

The field now renders in the Import settings panel for every non-export dataport, as a `DroppablePathInput` restricted to `acceptTypes={['asset']}` (dropping an object or document folder there would yield a path the asset tree cannot resolve). Read-only (execute-only) users see it in `ReadOnlyConfigView` alongside the object target folder. `assetFolder` joins the response allowlist (`DataportConfigResponse::TARGET_CONFIG_KEYS`); the write path already merged unknown targetconfig keys, so no change was needed there — the body's "keys outside the allowlist are stripped" wording was already inaccurate and now at least names the key.

Placeholders keep working: the engine runs the configured path through `replaceObjectIdentifier()`, so `/imports/{{ sku }}`-style values behave as they always did.
