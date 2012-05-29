$(function () {
    "use strict";

    var SitesModel = Backbone.Model.extend({
	defaults: {
	    error_message: undefined,
	    current_site: undefined,
	    site_id: 0,
	    longest_url: 0,
	    longest_name: 0,
	    site_count: 0,
	    sites: []
	},
	initialize: function() {
	    this.bind("change:sites", function() { this.update_sites(); });
	},
	update_sites: function() {
	    var sites = this.get("sites");
	    var longest_name = this.get("longest_name");
	    var longest_url = this.get("longest_url");
	    for (var i in sites) {
                var site = sites[i];
		longest_name = (site.name.length > longest_name) ? site.name.length : longest_name;
		longest_url = (site.url.length > longest_url) ? site.url.length : longest_url;
	    }
	    this.set({
		longest_name: longest_name,
		longest_url: longest_url,
		site_count: sites.length
	    });
	},
	set_site_details: function(site) {
	    this.set({
		current_site: site
	    });
	},
	get_site_details: function(site_id) {
	    var sites = this.get("sites");
            for (var i in sites) {
                var site = sites[i];
                if (site.id === site_id) {
                    if (!site.visits) {
                        // pretend like we're making an ajax request to get
                        // site details
                        site.visits = Math.ceil(Math.random() * 1000);
                    }
                    this.set_site_details(site);
                    break;
                }
            }
	},
	clear: function() {
	    this.set(this.defaults);
	    // the default values for `sites` is modified from []
	    // so set it to the correct value here
	    this.set({sites: []});

	},
	hide_error: function() {
	    //console.log("hide_error");
	    this.clear();
	    this.set({error_message: undefined});
	},
	fake_error: function() {
	    //console.log("fake_error");
            this.clear();
	    this.set({error_message: 'timeout in pretending to talk to server'});
        },
	add_sites: function(sites) {
	    var model_sites = this.get("sites") || [];
	    var id = this.get("site_id");
	    for (var i in sites) {
		var site = sites[i];
		id++;
		site.id = id;
		model_sites.push(site);
	    }
	    this.set({
		sites: model_sites,
		site_id: id
	    });
	    this.update_sites();
	},
	remove_last: function() {
	    var model_sites = this.get("sites");
	    model_sites.pop();
	    this.set({
		sites: model_sites,
		longest_url: 0,
		longest_name: 0,
	    });
	    this.update_sites();
	},
	remove_all: function() {
	    this.clear();
	},
	add_one: function() {
	    this.add_sites([
		{
		    name: 'Name', 
		    url: 'http://www.name.com'
		}
	    ]);
	},
	add_some: function() {
	    this.add_sites([
		{
                    name: 'Some 1', 
                    url: 'http://www.some-one.com'
                }, {
                    name: 'Some 2', 
                    url: 'http://www.some-two.com'
                }, {
                    name: 'Some 3', 
                    url: 'http://www.some-three.com'
                }, {
                    name: 'Some 4', 
                    url: 'http://www.some-four.com'
                }, {
                    name: 'Some 5', 
                    url: 'http://www.some-five.com'
                }
	    ]);
	}
    });
    var sites = new SitesModel();
    sites.set({
	sites:[
	    {
		id: 1000000,
                name: 'Some Site',
                url: 'http://www.some-site.com'
	    },
	    {
                id: 1000001,
                name: 'Another Site',
                url: 'http://www.another-site.com'
	    }
	]
    });

    var SiteSummaryView = Backbone.View.extend({
	el: $("#site-summary"),
	template: _.template($("#summary-template").html()),
	initialize: function() {
	    this.render();
        },
	render: function() {
	    this.$el.html(this.template(this.model.toJSON()));
	    return this;
	}
    });
    var SiteListView = Backbone.View.extend({
	el: $("#site-list>ul"),
	site_count: $("#site-count"),
	template: _.template($("#site-template").html()),	
	events: {
	    "click .link"  : "on_click"
	},
	initialize: function() {
	    this.render();
        },
	on_click: function(evt) {
	    evt.preventDefault();
	    var site_id = $(evt.target).attr('site_id');
            site_id = parseInt(site_id);
	    this.model.get_site_details(site_id);
	    var site_details = new SiteDetailsView({model: this.model})
	    site_details.render();
	},
	error: function() {
	    $("#site-count").addClass('error').html(0);
	},
	render: function() {
	    $("#site-count").removeClass('error')
	    var sites = this.model.get("sites");
	    var html = "";
	    for (var i in sites) {
		html += this.template({
		    site_id: sites[i].id,
		    site_name: sites[i].name
		})
	    }
	    this.$el.html(html);
	    return this;
	}
    });
    var ErrorView = Backbone.View.extend({
	el: $("#error"),
	message: $("#error").find('div'),
	events: {
	    "click button"  : "on_click"
	},
	on_click: function() {
	    this.model.hide_error();
	    this.$el.hide();
	},
	error: function() {
	    this.message.html(this.model.get("error_message"));
	    this.$el.show();
	}
    });
    var SiteDetailsView = Backbone.View.extend({
	el: $("#site-details"),
	template: _.template($("#details-template").html()),
	initialize: function() {
	    this.render();
        },
	render: function() {
	    this.model.get_site_details()
	    var site = this.model.get("current_site");
	    if (site) {
		this.$el.html(this.template({
		    site_name: site.name,
		    site_url: site.url,
		    site_visits: site.visits
		}));
		this.$el.show();
	    }
	    else {
		this.$el.hide();
	    }
	    return this;
	},
	error: function() {
	    this.$el.hide();
	}
    });
    var AppView = Backbone.View.extend({
	model: sites,
	el: $("#controls"),
	spinner: $('#controls img'),
	control_buttons: $('#controls button'),
	adding_buttons: $('#controls .adding'),
	removing_buttons: $('#controls .removing'),
	error: $('#fake-error'),
	tagName: "div",
	events: {
	    "click #add-one": "add_one",
	    "click #add-some": "add_some",
	    "click #remove-last": "remove_last",
	    "click #clear-all": "clear_all",
	    "click #fake-error": "fake_error"
	},
	initialize: function() {	    
	    this.site_details = new SiteDetailsView({model: sites});
	    this.site_list = new SiteListView({model: sites});
	    this.site_summary = new SiteSummaryView({model: sites});
	    this.error_view = new ErrorView({model: sites});
	    this.render();
	},
	render: function() {
	    this.spinner.hide();
	    this.adding_buttons.removeAttr('disabled');
	    var sites = this.model.get("sites");
	    if (sites.length > 0) {
		this.removing_buttons.removeAttr('disabled');
	    }
	    this.error.removeAttr('disabled');
	},
	success: function() {
	    this.control_buttons.attr('disabled', 'disabled');
	    this.spinner.show();
	},
	add_one: function() {
	    this.success();

	    this.model.add_one();
	    this.site_list.render();
	    this.site_summary.render();

	    this.render();
	},
	add_some: function() {
	    this.success();

	    this.model.add_some();
	    this.site_list.render();
	    this.site_summary.render();
	    
	    this.render();
	},
	remove_last: function() {
	    this.success();

	    this.model.remove_last();
	    this.site_list.render();
	    this.site_summary.render();
	    this.site_details.render();

	    this.render();
	},   
	clear_all: function() {
	    this.success();

	    this.model.remove_all();
	    this.site_list.render();
	    this.site_summary.render();
	    this.site_details.render();

	    this.render();
	},
	fake_error: function() {
	    this.model.fake_error();
	    this.error_view.error();
	    this.site_list.render();
	    this.model.set({
		longest_url: "",
		longest_name: "",
	    });
	    this.site_summary.render();
	    this.site_details.render();
	    this.site_list.error();
	}
    });
    var App = new AppView;

});

$(function () {
    "use strict";

    function Controller() {

        function fake_error() {
            var that = this;

            that.send_working();
            // pretend like this takes a while
            setTimeout(function () {
                that.send_error('timeout', 
                    'Nano-MVC died!!!!!');
            }, 1000);
        }

        var controller = nano.Controller();
        return $.extend(controller, {
            fake_error: fake_error,
        });

    }

    function ErrorView() {
        
        var $error = $('#error');
        var $error_message = $error.find('div');
 
        $error.on('click', 'button', function () {
            $error.hide();
        });

        function child_init(controller) {
        	console.log('good morning')
            $('#fake-error-nano').on('click', function () {
            	console.log('hey')
                controller.fake_error();
            });
        }

        function error(controller, type) {
            $error_message.html(controller.error.message)
            $error.show();
        }

        function working(controller, type) {
            $error.hide();
        }

        var view = nano.View();
        return $.extend(view, {
            // working clears us, so no need for success
            child_init: child_init,
            error: error,
            working: working
        });
    }


    function init(model) {
        var controller = new Controller();

        var errorView = new ErrorView();
        errorView.init(controller);
    }

	window.demo = {
	    init: init,
	};

}());


