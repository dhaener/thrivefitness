var drupalgap = {
  'modules':{
	  'core':[
	     {'name':'api'},
	     {'name':'block'},
	     {'name':'comment'},
	     {'name':'dashboard'},
	     {'name':'entity'},
	     {'name':'field'},
	     {'name':'form'},
	     {'name':'menu'},
	     {'name':'node'},
	     {'name':'services',
	       'includes':[
		       {'name':'comment'},
		       {'name':'drupalgap_content'},
		       {'name':'drupalgap_system'},
		       {'name':'drupalgap_taxonomy'},
		       {'name':'drupalgap_user'},
		       {'name':'file'},
		       {'name':'node'},
		       {'name':'services'},
		       {'name':'system'},
		       {'name':'taxonomy_term'},
		       {'name':'taxonomy_vocabulary'},
		       {'name':'user'},
	       ]
	     },
	     {'name':'system'},
	     {'name':'taxonomy'},
	     {'name':'user'},
	     {'name':'views_datasource'},
	   ]
  },
  'module_paths':[],
  'includes':[
      {'name':'common'},
      {'name':'menu'},
      {'name':'module'},
      {'name':'theme'},
  ],
  /**
   * User Default Values
   *   Do not change these values unless you are feeling adventurous.
   */
  'user':{
    'uid':0,
    'name':'Anonymous', /* TODO - this value should come from the drupal site */
    'roles':{
      '1':'anonymous user'
    },
  },
  'online':false,
  'destination':'',
  /*'account':{ },
  'account_edit':{ },*/
  'api':{}, // <!-- api -->
  'blocks':[],
  /*'comment':{ },
  'comment_edit':{ },*/
  /*'entity':{},
  'entity_edit':{},*/
  'entity_info':{ }, /* <!-- entity_info --> */
  'field_info_fields':{ }, /* <!-- field_info_fields --> */
  'field_info_instances':{ }, /* <!-- field_info_instances --> */
  /*'form':{ },
  'form_state':{ },*/
  'form_errors':{ },
  'form_states':[],
  /*'node':{ },
  'node_edit':{ },*/
  'menus':{},
  'menu_links':{}, /* <!-- menu_links --> */
  'menu_router':{}, /* <!-- menu_router --> */
  'page':{'variables':{}}, /* <!-- page --> */
  'path':'', /* The current menu path. */
  'services':{}, // <!-- services -->
  /*'taxonomy_term':{ },
  'taxonomy_term_edit':{ },
  'taxonomy_vocabulary':{ },
  'taxonomy_vocabulary_edit':{ },*/
  'title':'',
  'theme_path':'',
  'themes':[],
  'theme_registry':{},
  'views_datasource':{}, // <!-- views_datasource -->
}; // <!-- drupalgap -->

/**
 * Given a path to a javascript file relative to the app's www directory,
 * this will load the javascript file so it will be available in scope.
 */
function drupalgap_add_js() {
  try {
    var data;
    if (arguments[0]) { data = arguments[0]; }
    jQuery.ajax({
      async:false,
      type:'GET',
      url:data,
      data:null,
      success:function(){
        if (drupalgap.settings.debug) {
          // Print the js path to the console.
          console.log(data);
        }
      },
      dataType:'script',
      error: function(xhr, textStatus, errorThrown) {
        console.log(JSON.stringify(xhr));
        alert('drupalgap_add_js - error - (' + data + ' : ' + textStatus + ') ' + errorThrown);
      }
    });
  }
  catch (error) {
    alert('drupalgap_add_js - ' + error);
  }
}

/**
 * Rounds up all blocks defined by hook_block_info and places them in the
 * drupalgap.blocks array.
 */
function drupalgap_blocks_load() {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_blocks_load()');
      console.log(JSON.stringify(arguments));
    }
    /*drupalgap.blocks[0] = {};
    var modules = module_implements('block_info');
    if (modules) {
      $.each(modules, function(index, module){
          var blocks = module_invoke(module, 'block_info');
          if (blocks) {
            $.each(blocks, function(delta, block){
              // Assign the delta as the name of the block, set the delta of the
              // block as well, and set the module name on the block for reference.
              block.name = delta;
              block.delta = delta;
              block.module = module;  
              // Add the block to drupalgap.blocks.
              eval("drupalgap.blocks[0]." + delta + " = block;");
              //drupalgap.blocks[delta] = block;
            });
          }
      });
    }*/
    drupalgap.blocks = module_invoke_all('block_info');
    if (drupalgap.settings.debug) {
      console.log(JSON.stringify(drupalgap.blocks));
    }
  }
  catch (error) {
    alert('drupalgap_blocks_load - ' + error);
  }
}


/**
 * Takes option set 2, grabs the success/error callback(s), if any, 
 * and appends them onto option set 1's callback(s), then returns
 * the newly assembled option set.
 */
function drupalgap_chain_callbacks(options_set_1, options_set_2) {
	
	//console.log(JSON.stringify(options_set_1));
	//console.log(JSON.stringify(options_set_2));
	
	// Setup the new options.
	var new_options_set = {};
	$.extend(true, new_options_set, options_set_1);
	
	// Chain the success callbacks.
	if (options_set_2.success) {
		if (new_options_set.success) {
			if (!$.isArray(new_options_set.success)) {
				var backup = new_options_set.success;
				new_options_set.success = [];
				new_options_set.success.push(backup);
			}
			new_options_set.success.push(options_set_2.success);
		}
		else {
			new_options_set.success = options_set_2.success; 
		}
	}
	
	// Chain the error callbacks.
	if (options_set_2.error) {
		if (new_options_set.error) {
			if (!$.isArray(new_options_set.error)) {	
				var backup = new_options_set.error;
				new_options_set.error = [];
				new_options_set.error.push(backup);
			}
			new_options_set.error.push(options_set_2.error);
		}
		else {
			new_options_set.error = options_set_2.error; 
		}
	}
	
	// For all other variables in option set 2, add them to the new option set.
	$.each(options_set_2, function(index, object){
		if (index != 'success' && index != 'error') {
			new_options_set[index] = object;
		}
	});
	
	// Return the new option set.
	//console.log(JSON.stringify(new_options_set));
	return new_options_set;
}

/**
 * Checks the devices connection and sets drupalgap.online to true if the
 * device has a connection, false otherwise.
 * @returns A string indicating the type of connection according to PhoneGap.
 */
function drupalgap_check_connection() {
    // TODO - Uncomment and use this line once cordova 2.3 is released
    // instead of the navigator.network.connection.type variable.
    //var networkState = navigator.connection.type;
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';
    
    if (states[networkState] == 'No network connection') {
    	drupalgap.online = false;
    }
    else {
    	drupalgap.online = true;
    }

    return states[networkState];
}

/**
 * Implements PhoneGap's deviceready().
 */
function drupalgap_deviceready() {
  // PhoneGap is loaded and it is now safe for DrupalGap to start...
  // Load up settings.
  drupalgap_settings_load();
  // Load up includes.
  drupalgap_includes_load();
	// Load up modules.
	drupalgap_modules_load();
	// Load up the theme.
	drupalgap_theme_load();
	// Load up blocks.
	drupalgap_blocks_load();
	// Initialize menu links.
	menu_router_build();
	// Initialize menus.
	drupalgap_menus_load();
	// Initialize the theme registry.
	drupalgap_theme_registry_build();
	// Verify site path is set.
	if (!drupalgap.settings.site_path || drupalgap.settings.site_path == '') {
		navigator.notification.alert(
		    'No site path to Drupal set in the app/settings.js file!',
		    function(){},
		    'Error',
		    'OK'
		);
		return false;
	}
	// Check device connection. If the device is offline, warn the user and then
	// go to the offline page.
	drupalgap_check_connection();
	if (!drupalgap.online) {
		module_invoke_all('device_offine');
		navigator.notification.alert(
		    'No connection found!',
		    function(){ drupalgap_goto('offline'); },
		    'Offline',
		    'OK'
		);
		return false;
	}
	else {
	  
	  // Device is online, let's call any implementations of hook_device_online().
	  // If any implementation returns false, that means they don't want DrupalGap
	  // to continue with the System Connect call, so we'll skip that and go
	  // straight to the App's front page.
	  var proceed = true;
		var invocation_results = module_invoke_all('device_online');
		if (invocation_results && invocation_results.length > 0) {
		  $.each(invocation_results, function(index, object){
		      if (object === false) {
		        proceed = false;
		        return false;
		      }
		  });
		}
		if (!proceed) {
		  drupalgap_goto('');
		  // TODO - if module's are going to skip the System Connect call, then we
		  // need to make sure drupalgap.user is set up with appropriate defaults.
		}
		else {
			// Device is online, let's make a call to the
			// DrupalGap System Connect Service Resource
			drupalgap.services.drupalgap_system.connect.call({
				'success':function(result){
				  // Call all hook_device_connected implementations then go to
				  // the front page.
					module_invoke_all('device_connected');
					drupalgap_goto('');
				},
				'error':function(jqXHR, textStatus, errorThrown) {
					if (errorThrown == 'Not Found') {
						navigator.notification.alert(
						    'Review DrupalGap Troubleshooting Topics!',
						    function(){
						      // TODO - Offer some helpful tips if the user gets stuck here!
						    },
						    'Unable to Connect to Drupal',
						    'OK'
						);
					}
				}
			});
		}
	}
}

/**
 * Checks if a given file exists, returns true or false.
 * @param  {string} path 
 *   A path to a file
 * @return {bool}      
 *   True if file exists, else flase
 */
function drupalgap_file_exists(path) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_file_exists(' + path + ')');
    }
    var file_exists = false;
    jQuery.ajax({
      async:false,
      type:'HEAD',
      url:path,
      success:function(){ file_exists = true; },
      error:function(xhr, textStatus, errorThrown) { }
    });
    return file_exists;
  }
  catch (error) {
    alert('drupalgap_file_exists - ' + error);
  }
}

/**
 * Reads entire file into a string and returns the string. Returns false if
 * it fails.
 */
function drupalgap_file_get_contents(path) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_file_get_contents(' + path + ')');
    }
    var file = false;
    jQuery.ajax({
      type:'GET',
      url:path,
      dataType:'html',
      data:null,
      async:false,
      success:function(data){ file = data; },
      error: function(xhr, textStatus, errorThrown) {
        console.log('drupalgap_file_get_contents - failed to load file (' + path + ')');
      }
    });
    return file;
  }
  catch (error) {
    alert('drupalgap_file_get_contents - ' + error);
  }
}


/**
 * See drupal_format_plural() for more information.
 * http://api.drupal.org/api/drupal/includes%21common.inc/function/format_plural/7
 */
function drupalgap_format_plural(count, singular, plural) {
  try {
    if (count == 1) {
      return singular;
    }
    return plural;
	}
	catch (error) {
	  alert('drupalgap_format_plural - ' + error);
	}
	return null;
}

/**
 * Given a JS function, this returns true if the function is available in the
 * scope, false otherwise.
 */
function drupalgap_function_exists(name) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_function_exists(' + name + ')');
    }
    return (eval('typeof ' + name) == 'function');
  }
  catch (error) {
    alert('drupalgap_function_exists - ' + error);
  }
}

/**
 * Given an html string from a *.tpl.html file, this will extract all of the
 * placeholders names and return them in an array. Returns false otherwise.
 */
function drupalgap_get_placeholders_from_html(html) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_get_placeholders_from_html()');
      console.log(JSON.stringify(arguments));
    }
    var placeholders = false;
    if (html) {
      placeholders = html.match(/(?!{:)([\w]+)(?=:})/g);
    }
    return placeholders;
  }
  catch (error) {
    alert('drupalgap_get_placeholders_from_html - ' + error);
  }
}


/**
 * 
 * @param type
 * @param name
 */
function drupalgap_get_path(type, name) {
  try {
    var path = '';
    var found_it = false;
    if (type == 'module') {
      $.each(drupalgap.modules, function(bundle, modules){
        $.each(modules, function(index, module){
          if (name == module.name) {
            path = drupalgap_modules_get_bundle_directory(bundle) + '/';
            path += module.name;
            found_it = true;
          }
          if (found_it) {
            return false;
          }
        });
        if (found_it) {
          return false;
        }
      });
    }
    return path;
  }
  catch (error) {
    alert('drupalgap_get_path - ' + error);
  }
	return null;
}

/**
 * Implementation of drupal_get_title().
 */
function drupalgap_get_title() {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_get_title()');
      console.log(JSON.stringify(arguments));
    }
    return drupalgap.title;
  }
  catch (error) {
    alert('drupalgap_get_title - ' + error);
  }
}

/**
 * Given a router path, this will return an array containing the indexes of
 * where the wildcards (%) are present in the router path. Returns false if
 * there are no wildcards present.
 */
function drupalgap_get_wildcards_from_router_path(router_path) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_get_wildcards_from_router_path(' + router_path + ')');
    }
    var wildcards = false;
    
    return wildcards;
  }
  catch (error) {
    alert('drupalgap_get_wildcards_from_router_path - ' + error);
  }
}


/**
 * Given a drupal image file uri, this will return the path to the image on the
 * Drupal site.
 */
function drupalgap_image_path(uri) {
	try {
		var src = drupalgap.settings.site_path + drupalgap.settings.base_path + uri;
		if (src.indexOf('public://') != -1) {
			var src = src.replace('public://', drupalgap.settings.file_public_path + '/');
		}
		return src;
	}
	catch (error) {
		alert('drupalgap_image_path - ' + error);
	}
	return null;
}

/**
 * Loads the js files in includes specified by drupalgap.includes.
 */
function drupalgap_includes_load() {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_includes_load()');
      console.log(JSON.stringify(drupalgap.includes));
    }
    if (drupalgap.includes != null && drupalgap.includes.length != 0) {
      $.each(drupalgap.includes, function(index, include){
          var include_path =  'includes/' + include.name + '.inc.js';
          jQuery.ajax({
              async:false,
              type:'GET',
              url:include_path,
              data:null,
              success:function(){
                if (drupalgap.settings.debug) {
                  // Print the include path to the console.
                  console.log(include_path);
                }
              },
              dataType:'script',
              error: function(xhr, textStatus, errorThrown) {
                  // Look at the `textStatus` and/or `errorThrown` properties.
              }
          });
      });
    }
  }
  catch (error) {
    alert('drupalgap_includes_load - ' + error);
  }
}

/**
 * Given an html list element id and an array of items, this will populate
 * the clear the list, populate it with the items, destroy the list and then
 * refresh the list with the new items.
 */
function drupalgap_item_list_populate(list_css_selector, items) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_item_list_populate()');
      console.log(JSON.stringify(arguments));
    }
    // TODO - this could use some validation and alerts for improper input.
    $(list_css_selector).html("");
    for (var i = 0; i < items.length; i ++) {
      $(list_css_selector).append($("<li></li>",{"html":items[i]}));
    }
    $(list_css_selector).listview("destroy").listview();
  }
  catch (error) {
    alert('drupalgap_item_list_populate - ' + error);
  }
}

/**
 * Returns array of jQM Page event names.
 *   http://api.jquerymobile.com/category/events/
 */
function drupalgap_jqm_page_events() {
  try {
    return [
      'pagebeforechange',
      'pagebeforecreate',
      'pagebeforehide',
      'pagebeforeload',
      'pagebeforeshow',
      'pagechange',
      'pagechangefailed',
      'pagecreate',
      'pagehide',
      'pageinit',
      'pageload',
      'pageloadfailed',
      'pageremove',
      'pageshow'
    ];
  }
  catch (error) {
    alert('drupalgap_jqm_page_events - ' + error);
  }
}

/**
 * Checks to see if the current user has access to the given path. Returns true
 * if the user has access, false otherwise. You may optionally pass in a user
 * account object as the second argument to check access on a specific user.
 */
function drupalgap_menu_access(path) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_menu_access(' + path + ')');
    }
    // User #1 is allowed to do anything, I mean anything.
    if (drupalgap.user.uid == 1) { return true; }
    // Everybody else will not have access unless we prove otherwise.
    var access = false;
    if (drupalgap.menu_links[path]) {
      // Check to see if there is an access callback specified with the menu link.
      if (typeof drupalgap.menu_links[path].access_callback === 'undefined') {
        // No access call back specified, if there are any access arguments
        // on the menu link, then it is assumed they are user permission machine
        // names, so check that user account's role(s) for that permissions to
        // grant access.
        if (drupalgap.menu_links[path].access_arguments) {
          // TODO - implement
        }
        else {
          // There is no access callback and no access arguments specified with
          // the menu link, so we'll assume everyone has access.
          access = true;
        }
      }
      else {
        // There is an access call back specified, call it by passing along any
        // arguments. Replace any entity argument ids with the entity object.
        var function_name = drupalgap.menu_links[path].access_callback;
        if (drupalgap_function_exists(function_name)) {
          var fn = window[function_name];
          var access_arguments = drupalgap.menu_links[path].access_arguments;
          var args = arg();
          drupalgap_prepare_argument_entities(access_arguments, args);
          return fn.apply(null, Array.prototype.slice.call(access_arguments));
          //return fn();
        }
        else {
          alert('drupalgap_menu_access - access call back (' + function_name + ') does not exist');
        }
      }
    }
    else {
      alert('drupalgap_menu_access - path (' + path + ') does not exist');
    }
    return access;
  }
  catch (error) {
    alert('drupalgap_menu_access - ' + error);
  }
}

/**
 * Given a module name, this will return the module inside drupalgap.modules.
 */
function drupalgap_module_load(module_name) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_module_load()');
      console.log(JSON.stringify(arguments));
    }
    var loaded_module = null;
    $.each(drupalgap.modules, function(bundle, modules){
        if (!loaded_module) {
          $.each(modules, function(index, module){
              if (module.name == module_name) {
                // Save reference to module, then break out of loop.
                loaded_module = module;
                return false;
              }
          });
        }
        else {
          // Module loaded, break out of loop.
          return false;
        }
    });
    if (drupalgap.settings.debug) {
      console.log(JSON.stringify(loaded_module));
    }
    return loaded_module;
  }
  catch (error) {
    alert('drupalgap_module_load - ' + error);
  }
}

/**
 * Given a module bundle type, this will return the path to that module bundle's
 * directory.
 */
function drupalgap_modules_get_bundle_directory(bundle) {
  try {
    dir = '';
    if (bundle == 'core') { dir = 'modules'; }
    else if (bundle == 'contrib') { dir = 'app/modules'; }
    else if (bundle == 'custom') { dir = 'app/modules/custom'; }
    return dir;
  }
  catch (error) {
    alert('drupalgap_modules_get_bundle_directory - ' + error);
  }
  return '';
}

/**
 * Loads each drupalgap module so they are available in the JS scope.
 */
function drupalgap_modules_load() {
	if (drupalgap.modules != null && drupalgap.modules.length != 0) {
		$.each(drupalgap.modules, function(bundle, modules){
			$.each(modules, function(index, module){
				// Determine module directory.
				dir = drupalgap_modules_get_bundle_directory(bundle);
				module_base_path = dir + '/' + module.name;
				// Add module .js file to array of paths to load.
				module_path =  module_base_path + '/' + module.name + '.js';
				modules_paths = [module_path];
				// If there are any includes with this module, add them to the list of
				// paths to include.
				if (module.includes != null && module.includes.length != 0) {
					$.each(module.includes, function(include_index, include_object){
						modules_paths.push(module_base_path + '/' + include_object.name + '.js');
					});
				}
				// Now load all the paths for this module.
				$.each(modules_paths, function(modules_paths_index, modules_paths_object){
					jQuery.ajax({
					    async:false,
					    type:'GET',
					    url:modules_paths_object,
					    data:null,
					    success:function(){
					    	if (drupalgap.settings.debug) {
					    		// Print the module path to the console.
					    		console.log(modules_paths_object);
					    	}
					    },
					    dataType:'script',
					    error: function(xhr, textStatus, errorThrown) {
					        // Look at the `textStatus` and/or `errorThrown` properties.
					    }
					});
				});
			});
		});
		// Now invoke hook_install on all modules.
		module_invoke_all('install');
	}
}

/**
 * Given a router path (and optional path, defaults to current drupalgap.path if
 * one isn't provided), this takes the path's arguments and replaces any
 * wildcards (%) in the router path with the corresponding path argument(s). It
 * then returns the assembled path. Returns false otherwise.
 */
function drupalgap_place_args_in_path(input_path) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_place_args_in_path(' + input_path + ')');
    }
    var assembled_path = false;
    if (input_path) {
      
      // Determine path to use and break it up into its args.
      var path = drupalgap.path;
      if (arguments[1]) { path = arguments[1]; }
      var path_args = arg(null, path);
      
      // Grab wild cards from router path then replace each wild card with
      // the corresponding path arg.
      var wildcards;
      var input_path_args = arg(null, input_path);
      if (input_path_args && input_path_args.length > 0) {
        $.each(input_path_args, function(index, arg){
            if (arg == '%') {
              if (!wildcards) { wildcards = []; }
              wildcards.push(index);
            }
        });
        if (wildcards && wildcards.length > 0) {
          $.each(wildcards, function(index, wildcard){
              if (path_args[wildcard]) {
                input_path_args[wildcard] = path_args[wildcard];
              }
          });
          assembled_path = input_path_args.join('/');
        }
      }
    }
    return assembled_path;
  }
  catch (error) {
    alert('drupalgap_place_args_in_path - ' + error);
  }
}
/**
 * Converts a hook_menu items page_arguments path like node/123 so arg zero
 * would be 'node' and arg 1 would be the loaded entity node.
 */
function drupalgap_prepare_argument_entities(page_arguments, args) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_prepare_argument_entities()');
      console.log(JSON.stringify(arguments));
    }
    // If argument zero is an entity type (or base type, e.g. taxonomy), and we
    // have at least one integer argument, replace the page call back's integer
    // argument index with the loaded entity.
    if (args.length > 1 &&
          (
            args[0] == 'comment' ||
            args[0] == 'node' ||
            (args[0] == 'taxonomy' && (args[1] == 'vocabulary' || args[1] == 'term')) ||
            args[0] == 'user'
          )
    ) {
      var found_int_arg = false;
      var int_arg_index = null;
      for (var i = 0; i < args.length; i++) {
        if (is_int(parseInt(args[i]))) {
          int_arg_index = i; // Save the arg index so we can replace it later.
          found_int_arg = true;
          break;
        }
      }
      if (!found_int_arg) { return; }
      // Determine the naming convention for the entity load function.
      var load_function_prefix = args[0]; // default
      if (args[0] == 'taxonomy') {
        if (args[1] == 'vocabulary' || args[1] == 'term') {
          load_function_prefix = args[0] + '_' + args[1];
        }
      }
      var load_function = load_function_prefix + '_load'; 
      if (drupalgap_function_exists(load_function)) {
        var entity_fn = window[load_function];
        var entity = entity_fn(parseInt(args[int_arg_index]));
        // Now that we have the entity loaded, replace the first integer we find
        // in the page arguments with the loaded entity.
        $.each(page_arguments, function(index, page_argument){
            if (is_int(parseInt(page_argument))) {
              page_arguments[index] = entity;
              // Attach the entity to drupalgap entity and entity_edit.
              // NO NO NO, this is bad, stop using this idea, you just need to
              // pass the entiaty around and have caching in place so folks
              // can load entities with out too much worry.
              //drupalgap.entity = entity;
              //drupalgap.entity_edit = entity;
              return false;
            }
        });
      }
      else {
        alert('drupalgap_prepare_argument_entities - load function not implemented! ' + load_function);
      }
    }
  }
  catch (error) {
    alert('drupalgap_prepare_argument_entities - ' + error);
  }
}

/**
 * Implementation of drupal_set_title().
 */
function drupalgap_set_title(title) {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_set_title(' + title + ')');
    }
    if (title) { drupalgap.title = title; }
  }
  catch (error) {
    alert('drupalgap_set_title - ' + error);
  }
}

/**
 * Loads the settings specified in app/settings.js into the app.
 */
function drupalgap_settings_load() {
  try {
    settings_file_path = 'app/settings.js';
    jQuery.ajax({
      async:false,
      type:'GET',
      url:settings_file_path,
      data:null,
      success:function(){
        if (drupalgap.settings.debug) {
          // Set the title to the settings title.
          drupalgap_set_title(drupalgap.settings.title);
        }
      },
      dataType:'script',
      error: function(xhr, textStatus, errorThrown) {
        navigator.notification.alert(
          'Failed to load the settings.js file in the app folder!',
          function(){},
          'Error',
          'OK'
        );
      }
    });
  }
  catch(error) {
    alert('drupalgap_settings_load - ' + error);
  }
}

/**
 * Load the theme specified by drupalgap.settings.theme into drupalgap.theme
 * Returns true on success, false if it fails.
 */
function drupalgap_theme_load() {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_theme_load()');
      console.log(JSON.stringify(arguments));
    }
    if (!drupalgap.settings.theme) {
      alert('drupalgap_theme_load - no theme specified in settings.js');
    }
    else {
      // Pull the theme name from the settings.js file.
      var theme_name = drupalgap.settings.theme;
      // Let's try to load to theme's js file first by looking in the core
      // themes directory, then in the app/themes directory.
      var theme_path = 'themes/' + theme_name + '/' + theme_name + '.js';
      if (!drupalgap_file_exists(theme_path)) {
        theme_path = 'app/themes/' + theme_name + '/' + theme_name + '.js';
        if (!drupalgap_file_exists(theme_path)) {
          alert("drupalgap_theme_load - Failed to load theme! The theme's JS file does not exist: " + theme_path + ')');
          return false;
        }
      }
      // We found the theme's js file, add it to the page.
      drupalgap_add_js(theme_path);
      // Call the theme's template_info implementation.
      var template_info_function = theme_name + '_info';
      if (drupalgap_function_exists(template_info_function)) {
        var fn = window[template_info_function];
        drupalgap.theme = fn();
        if (drupalgap.settings.debug) {
          console.log('theme loaded: ' + theme_name);
          console.log(JSON.stringify(drupalgap.theme));
        }
        // Theme loaded successfully! Set the drupalgap.theme_path and return
        // true.
        drupalgap.theme_path = theme_path.replace('/' + theme_name + '.js', '');
        return true;
      }
      else {
        alert('drupalgap_theme_load() - failed - ' + template_info_function + '() does not exist!');
      }
    }
    return false;
  }
  catch (error) {
    alert('drupalgap_theme_load - ' + error);
  }
}

/**
 * This calls all implements of hook_theme and builds the DrupalGap theme
 * registry.
 */
function drupalgap_theme_registry_build() {
  try {
    if (drupalgap.settings.debug) {
      console.log('drupalgap_theme_registry_build()');
      console.log(JSON.stringify(arguments));
    }
    var modules = module_implements('theme');
    $.each(modules, function(index, module){
        var function_name = module + '_theme';
        var fn = window[function_name];
        var hook_theme = fn();
        $.each(hook_theme, function(element, variables){
            variables.path = drupalgap_get_path('module', module);
            eval('drupalgap.theme_registry.' + element + ' = variables;');
        });
    });
  }
  catch (error) {
    alert('drupalgap_theme_registry_build - ' + error);
  }
}

/**
 * This is called once the <body> element's onload is fired. We then set the
 * PhoneGap 'deviceready' event listener to drupalgap_deviceready().
 */
function drupalgap_onload() {
	document.addEventListener("deviceready", drupalgap_deviceready, false);
}

/*
 * Given a drupal permission machine name, this function returns true if the
 * current user has that permission, false otherwise. Here is example input
 * that checks to see if the current user has the 'access content' permission.
 * 	Example Usage:
 * 		user_access = drupalgap_user_access({'permission':'access content'});
 * 		if (user_access) {
 * 			alert("You have the 'access content' permission.");
 * 		}
 * 		else {
 * 			alert("You do not have the 'access content' permission.");
 * 		}
 */
function drupalgap_user_access(options) {
	try {
		// Make sure they provided a permission.
		if (options.permission == null) {
			alert("drupalgap_user_access - permission not provided");
			return false;
		}
		// User 1 always has permission.
		if (drupalgap.user.uid == 1) {
			return true;
		}
		// For everyone else, assume they don't have permission. Iterate over
		// drupalgap.user.permissions to see if the current user has the given
		// permission, then return the result.
		access = false;
		if (drupalgap.user.permissions && drupalgap.user.permissions.length != 0) {
      $.each(drupalgap.user.permissions, function(index, permission){
        if (options.permission == permission) {
          access = true;
          return;
        }
      });
		}
		return access;
	}
	catch (error) {
		alert("drupalgap_user_access - " + error);
	}
	return false;
}

$('.drupalgap_front').live('click', function(){
    drupalgap_changePage(drupalgap.settings.front);
});

// http://stackoverflow.com/a/3886106/763010
function is_int(n) {
   return typeof n === 'number' && n % 1 == 0;
}

function ucfirst (str) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Onno Marsman
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // *     example 1: ucfirst('kevin van zonneveld');
  // *     returns 1: 'Kevin van zonneveld'
  str += '';
  var f = str.charAt(0).toUpperCase();
  return f + str.substr(1);
}
