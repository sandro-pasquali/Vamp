$._ = {};

$(function() {

    var tree    = [];
    var values  = {};
    var metrics = {};
    
    var lastMetric;
    var currentGroup;
    
    //  Capture 3 groups
    //
    var parseDefinition = function(s, rev) {
        var m = s.match(/^([\w.\-]*):\/\/([\w.\-]*)\/([\w.\-]*)$/);
        var r = {
            metric      : "",
            authority   : "",
            scheme      : ""
        };
        
        if(m) {
            m.shift();
            r.metric    = m[2];
            r.authority = m[1];
            r.scheme    = m[0]
        }
        
        return r;
    };
    
    var displayGroupData = function(grp) {
        var data = tree[grp];
        var coll = {}
        var source;
        var measure;
        var values;
        
        for(source in data) {
            for(measure in data[source]) {
                coll[measure] = coll[measure] || {};
                
                //  A god-view of all sources and how their common measures compare.
                //
            }
        }
    };

    var listFromJson = function(data, authority, init) {

        var h = '<ul class="' + (init ? 'side_tree' : 'tree_branch') + '">'; 
        var key;
        var cm;
        var x;

        for(key in data) {

            if(data[key] && typeof(data[key]) == 'object') {
            
                if(data[key].hasOwnProperty("link")) {

                   // h += '<li rel="' + data[key].link + '" class="data_link">' + key + '</li>';

                    metrics[lastMetric][authority] = metrics[lastMetric][authority] || [];
                    metrics[lastMetric][authority].push(data[key].link);

                } else {
                
                    lastMetric = key;
                    if(metrics[key] === void 0) {
                        metrics[key] = {};
                    }
                
                    h += '<li class="nav-data-metric" rel="' + authority + '" name="' + key + '">' + key;
                    h += listFromJson(data[key], authority);
                    h += '</li>';
                }
            } else {
                h += ('<li>' + key + ':&quot;' + data[key] + '&quot;</li>' );
            }
        };
        h += '</ul>';  
        
        return h;
    };	

    var showGroupDataNav = function(grp) {
    
        currentGroup    = grp;
        metrics         = [];
        
        var html = "";
        var authority;
        var c   = 0;
        
        for(authority in tree[grp]) {
        
            //  ' + (c === 0 ? "accordion-startopen" : "") + '
        
            html += '<div class="accordion-trigger" name="' + authority + '" rel="' + c + '">' + authority + '</div>';
            html += '<div class="accordion-body">' + listFromJson(tree[grp][authority], authority, true) + '</div>';
            ++c
        }
        html += "</div>";
        
        $(".well .groupdata").empty().append(html);

/*
        $(".side_tree").treeview({
            collapsed: true,
            animated: "medium",
            persist: "location"
        });
*/        
        //  Add individual metric link handlers, using main group as delegate
        //
        $(".side_tree").on("click", "li.nav-data-metric", function(e) {
            var $t          = $(e.currentTarget);
            var metric      = $t.attr("name");
            var authority   = $t.attr("rel");
            
            console.log(metric + " -- " + authority);
            
            console.log(metrics[metric]);
            e.stopPropagation();
        });
        
        $(".groupdata").accordion({
            openSpeed       : 10,
            onOver      : function(trig, e) {
                trig.addClass('accordion-hover');
            },
            onOut       : function(trig, e) {
                trig.removeClass('accordion-hover');										
            },
            onOpen      : function(trig, e) {
                trig.addClass('accordion-selected');
                
                var authority = trig.attr("name");
            },
            onClose     : function(trig, e) {                    
                trig.removeClass('accordion-selected');
            }
        });
    }

    //  Load the data for this session.
    //
    $.getJSON("demo-data.json", function(json) {
        
        var md      = json.metric_definitions;
        var vd      = json.metric_values;
        var mx      = md.length;
        var vx      = vd.length;
        var ob;
        
        var parsedSchema;
        var definition;
        var metric;
        var authority;
        var scheme;
        var ps;
        var v;
        var c;
        
        //  Clear on each load...
        //
        tree    = [];
        values  = {};
        
        while(vx--) {
            values[vd[vx].url] = vd[vx].values;
        }
        
       // console.log(json);
       // console.log(values);
        
        while(mx--) {
            
            definition          = md[mx].url;
            parsedDefinition    = parseDefinition(definition);
            scheme              = parsedDefinition.scheme;
            authority           = parsedDefinition.authority;
            metric              = parsedDefinition.metric;
            
            if(!tree.hasOwnProperty(scheme)) {
                tree[scheme] = {};
            }
            
            if(!tree[scheme].hasOwnProperty(authority)) {
                tree[scheme][authority] = {}
            }
            
            if(!tree[scheme][authority].hasOwnProperty(metric)) {
                tree[scheme][authority][metric] = [];
            }

            while(v = md[mx].value_urls.pop()){
                tree[scheme][authority][metric].push({
                    link: v
                });
            }
        }

        //  For each of the main data sources, create a top nav item
        //
        for(var w in tree) {
            $(".nav")
                .append('<li id="' + w + '"><a href="#">' + w +'</a></li>')
        }
        

        //  Top nav is drawn. Delegate click handler, and trigger a click on first item,
        //  opening up data accordion.
        //
        $(".nav").delegate("li", "click", function(e) {

            var id      = $(e.currentTarget).attr("id");

            showGroupDataNav(id);
            displayGroupData(id);
        })
        .find("li:first").trigger("click");
        
        //  Initialize tabs, and trigger default active data visualization.
        //
        $(".tabs")
            .on("click", "li a", function(e) {
                var sel = $(e.currentTarget).attr("href");
                console.log(sel);
                $._[sel.replace("#", "")].render({
                    dataFile    : $(e.currentTarget).attr("ref"),
                    selector    : "#temp_container"
                });
                
                $("#box_plot .row").empty();
                $("#temp_container svg").each(function() {
                    var $t = $(this);
                    
                    $("#box_plot .row")
                        .append('<div class="span3" class="box-plot-container"><h6>' + "metric" + '</h6></div>')
                        .find("div:last")
                        .append($t);
                });
                $("#temp_container").empty();
                
            })
            .find("li.active a")
            .trigger("click");
            
            console.log($._);
            
        $._.heatmap.render({
            selector    : "#heatmap"
        });
        
        $._.box_plot.render({
            selector    : "#box_plot"
        });
    });    
});