(function () {
    "use strict";

    function View(controller) {

        function init(controller) {
            var that = this;

            controller.subscribe(function () {
                that.handle.apply(that, arguments);
            });

            that.child_init(controller);
        }

        function handle(controller, event, type) {
            // this calls the method matching the msg 'event'
            this[event](controller, type);
        }

        function child_init(controller) {
        }

        function success(controller, type) {
        }

        function error(controller, type) {
        }

        function working(controller, type) {
        }

        return {
            // "private" methods that should not be overridden
            init: init,
            handle: handle,

            // "protected" methods that should always be overridden
            child_init: child_init,
            success: success,
            error: error,
            working: working,
        };
    }

    nano = window.nano || {};
    $.extend(nano, {
        View: View
    });
}());
