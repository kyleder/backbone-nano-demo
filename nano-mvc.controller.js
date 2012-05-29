(function () {

    function Controller() {
        var subscribers = $.Callbacks();

        // TODO: switch this out for a real pub/sub impl if/when we use one
        function subscribe(callback) {
            subscribers.add(callback);
        }

        /** Notify all of our subscribers about an event that just happened.
         * @param: controller - the controller object
         * @param: type - the type of event that happened
         *
         * the rest of the parameters will depend on the type of event.
         *
         * type working:
         * type success:
         * type error:
         */
        function publish() {
            // we'll pass along whatever args we recieved to the
            // subscribers
            var args = Array.prototype.slice.call(arguments);
            // after adding the controller as the first param
            args.unshift(this);
            subscribers.fireWith(this, args);
        }

        function init(model) {

            // initialize the model based on whatever state we have, it'll come
            // in from the page and we'll muck with it to turn those options in
            // to the mode. for now it's just a straight assignment.
            this.model = model;
            
            // once the model is ready we'll call success and everyone should
            // update to the current state.
            this.send_success();
        }

        function send_success() {
            this.error = undefined;
            publish.call(this, 'success');
        }

        function send_error(type, message) {
            this.error = {
                type: type,
                message: message
            };

            publish.call(this, 'error', type);
        }

        function send_working(type) {
            publish.call(this, 'working', type);
        }

        return {
            model: {},

            subscribe: subscribe,
            send_success: send_success,
            send_error: send_error,
            send_working: send_working,

            init: init,
        };
    }

    nano = window.nano || {};
    $.extend(nano, {
        Controller: Controller
    });
}());
