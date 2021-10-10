
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const menu_on = writable("about");

    /* src\Header.svelte generated by Svelte v3.43.1 */
    const file$2 = "src\\Header.svelte";

    function create_fragment$2(ctx) {
    	let header;
    	let div1;
    	let a;
    	let h1;
    	let t1;
    	let div0;
    	let nav;
    	let ul;
    	let li0;
    	let h40;
    	let t3;
    	let h41;
    	let t5;
    	let li1;
    	let h42;
    	let t7;
    	let h43;
    	let t9;
    	let li2;
    	let h44;
    	let t11;
    	let h45;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			a = element("a");
    			h1 = element("h1");
    			h1.textContent = "Akif Sahin Korkmaz";
    			t1 = space();
    			div0 = element("div");
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			h40 = element("h4");
    			h40.textContent = "About";
    			t3 = space();
    			h41 = element("h4");
    			h41.textContent = "About";
    			t5 = space();
    			li1 = element("li");
    			h42 = element("h4");
    			h42.textContent = "Skills";
    			t7 = space();
    			h43 = element("h4");
    			h43.textContent = "Skills";
    			t9 = space();
    			li2 = element("li");
    			h44 = element("h4");
    			h44.textContent = "Projects";
    			t11 = space();
    			h45 = element("h4");
    			h45.textContent = "Projects";
    			attr_dev(h1, "class", "svelte-1ru0pn2");
    			add_location(h1, file$2, 29, 20, 720);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-1ru0pn2");
    			add_location(a, file$2, 29, 8, 708);
    			attr_dev(h40, "class", "svelte-1ru0pn2");
    			add_location(h40, file$2, 34, 28, 861);
    			attr_dev(h41, "class", "svelte-1ru0pn2");
    			add_location(h41, file$2, 34, 44, 877);
    			attr_dev(li0, "class", "svelte-1ru0pn2");
    			add_location(li0, file$2, 34, 20, 853);
    			attr_dev(h42, "class", "svelte-1ru0pn2");
    			add_location(h42, file$2, 35, 28, 947);
    			attr_dev(h43, "class", "svelte-1ru0pn2");
    			add_location(h43, file$2, 35, 44, 963);
    			attr_dev(li1, "class", "svelte-1ru0pn2");
    			add_location(li1, file$2, 35, 20, 939);
    			attr_dev(h44, "class", "svelte-1ru0pn2");
    			add_location(h44, file$2, 36, 28, 1034);
    			attr_dev(h45, "class", "svelte-1ru0pn2");
    			add_location(h45, file$2, 36, 48, 1054);
    			attr_dev(li2, "class", "svelte-1ru0pn2");
    			add_location(li2, file$2, 36, 20, 1026);
    			attr_dev(ul, "class", "svelte-1ru0pn2");
    			add_location(ul, file$2, 33, 16, 828);
    			attr_dev(nav, "class", "svelte-1ru0pn2");
    			add_location(nav, file$2, 32, 12, 806);
    			attr_dev(div0, "class", "navigation svelte-1ru0pn2");
    			add_location(div0, file$2, 31, 8, 769);
    			attr_dev(div1, "class", "content svelte-1ru0pn2");
    			add_location(div1, file$2, 28, 4, 678);
    			attr_dev(header, "class", "svelte-1ru0pn2");
    			add_location(header, file$2, 27, 0, 665);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, a);
    			append_dev(a, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, nav);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, h40);
    			append_dev(li0, t3);
    			append_dev(li0, h41);
    			/*h41_binding*/ ctx[3](h41);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, h42);
    			append_dev(li1, t7);
    			append_dev(li1, h43);
    			/*h43_binding*/ ctx[4](h43);
    			append_dev(ul, t9);
    			append_dev(ul, li2);
    			append_dev(li2, h44);
    			append_dev(li2, t11);
    			append_dev(li2, h45);
    			/*h45_binding*/ ctx[5](h45);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			/*h41_binding*/ ctx[3](null);
    			/*h43_binding*/ ctx[4](null);
    			/*h45_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let about, skills, projects;

    	onMount(() => {
    		about.addEventListener("click", () => {
    			if (menu_on != "about") {
    				menu_on.set("about");
    			}
    		});

    		skills.addEventListener("click", () => {
    			if (menu_on != "skills") {
    				menu_on.set("skills");
    			}
    		});

    		projects.addEventListener("click", () => {
    			if (menu_on != "projects") {
    				menu_on.set("projects");
    			}
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function h41_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			about = $$value;
    			$$invalidate(0, about);
    		});
    	}

    	function h43_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			skills = $$value;
    			$$invalidate(1, skills);
    		});
    	}

    	function h45_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			projects = $$value;
    			$$invalidate(2, projects);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		menu_on,
    		about,
    		skills,
    		projects
    	});

    	$$self.$inject_state = $$props => {
    		if ('about' in $$props) $$invalidate(0, about = $$props.about);
    		if ('skills' in $$props) $$invalidate(1, skills = $$props.skills);
    		if ('projects' in $$props) $$invalidate(2, projects = $$props.projects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [about, skills, projects, h41_binding, h43_binding, h45_binding];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\contact.svelte generated by Svelte v3.43.1 */
    const file$1 = "src\\contact.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let header;
    	let h40;
    	let t1;
    	let nav;
    	let ul;
    	let li0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let h41;
    	let t4;
    	let hr0;
    	let t5;
    	let li1;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t6;
    	let h42;
    	let t8;
    	let hr1;
    	let t9;
    	let li2;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t10;
    	let h43;
    	let t12;
    	let hr2;
    	let t13;
    	let div;
    	let p;
    	let t15;
    	let a3;
    	let h44;
    	let t17;
    	let h45;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			header = element("header");
    			h40 = element("h4");
    			h40.textContent = "Contact me";
    			t1 = space();
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			img0 = element("img");
    			t2 = space();
    			h41 = element("h4");
    			h41.textContent = "https://github.com/towendigo";
    			t4 = space();
    			hr0 = element("hr");
    			t5 = space();
    			li1 = element("li");
    			a1 = element("a");
    			img1 = element("img");
    			t6 = space();
    			h42 = element("h4");
    			h42.textContent = "https://www.linkedin.com/in/akif-sahin-korkmaz";
    			t8 = space();
    			hr1 = element("hr");
    			t9 = space();
    			li2 = element("li");
    			a2 = element("a");
    			img2 = element("img");
    			t10 = space();
    			h43 = element("h4");
    			h43.textContent = "akifsahinkorkmaz@outlook.com";
    			t12 = space();
    			hr2 = element("hr");
    			t13 = space();
    			div = element("div");
    			p = element("p");
    			p.textContent = "You can download my resume";
    			t15 = space();
    			a3 = element("a");
    			h44 = element("h4");
    			h44.textContent = "My Resume";
    			t17 = space();
    			h45 = element("h4");
    			h45.textContent = "My Resume";
    			attr_dev(h40, "class", "svelte-1oph6np");
    			add_location(h40, file$1, 21, 35, 531);
    			attr_dev(header, "class", "contact-title svelte-1oph6np");
    			add_location(header, file$1, 21, 4, 500);
    			if (!src_url_equal(img0.src, img0_src_value = "./static/git.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "github-logo");
    			attr_dev(img0, "class", "svelte-1oph6np");
    			add_location(img0, file$1, 24, 29, 614);
    			attr_dev(h41, "class", "svelte-1oph6np");
    			add_location(h41, file$1, 24, 76, 661);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-1oph6np");
    			add_location(a0, file$1, 24, 16, 601);
    			add_location(li0, file$1, 24, 12, 597);
    			attr_dev(hr0, "class", "svelte-1oph6np");
    			add_location(hr0, file$1, 25, 12, 723);
    			if (!src_url_equal(img1.src, img1_src_value = "./static/in.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "linkedin-logo");
    			attr_dev(img1, "class", "svelte-1oph6np");
    			add_location(img1, file$1, 26, 29, 757);
    			attr_dev(h42, "class", "svelte-1oph6np");
    			add_location(h42, file$1, 26, 77, 805);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "svelte-1oph6np");
    			add_location(a1, file$1, 26, 16, 744);
    			add_location(li1, file$1, 26, 12, 740);
    			attr_dev(hr1, "class", "svelte-1oph6np");
    			add_location(hr1, file$1, 27, 12, 884);
    			if (!src_url_equal(img2.src, img2_src_value = "./static/mail.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "e-mail");
    			attr_dev(img2, "class", "svelte-1oph6np");
    			add_location(img2, file$1, 28, 29, 918);
    			attr_dev(h43, "class", "svelte-1oph6np");
    			add_location(h43, file$1, 28, 72, 961);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "svelte-1oph6np");
    			add_location(a2, file$1, 28, 16, 905);
    			add_location(li2, file$1, 28, 12, 901);
    			attr_dev(hr2, "class", "svelte-1oph6np");
    			add_location(hr2, file$1, 29, 12, 1021);
    			attr_dev(ul, "class", "svelte-1oph6np");
    			add_location(ul, file$1, 23, 8, 580);
    			attr_dev(nav, "class", "svelte-1oph6np");
    			add_location(nav, file$1, 22, 4, 566);
    			attr_dev(p, "class", "b");
    			add_location(p, file$1, 34, 8, 1089);
    			attr_dev(h44, "class", "svelte-1oph6np");
    			add_location(h44, file$1, 35, 84, 1217);
    			attr_dev(h45, "class", "svelte-1oph6np");
    			add_location(h45, file$1, 35, 105, 1238);
    			attr_dev(a3, "href", "./static/AKIF_SAHIN_KORKMAZ.pdf");
    			attr_dev(a3, "download", "Akif_Sahin_Korkmaz_CV");
    			attr_dev(a3, "class", "svelte-1oph6np");
    			add_location(a3, file$1, 35, 8, 1141);
    			attr_dev(div, "class", "resume svelte-1oph6np");
    			add_location(div, file$1, 33, 4, 1060);
    			attr_dev(footer, "class", "svelte-1oph6np");
    			add_location(footer, file$1, 20, 0, 467);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, header);
    			append_dev(header, h40);
    			append_dev(footer, t1);
    			append_dev(footer, nav);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, img0);
    			append_dev(a0, t2);
    			append_dev(a0, h41);
    			append_dev(ul, t4);
    			append_dev(ul, hr0);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, img1);
    			append_dev(a1, t6);
    			append_dev(a1, h42);
    			append_dev(ul, t8);
    			append_dev(ul, hr1);
    			append_dev(ul, t9);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, img2);
    			append_dev(a2, t10);
    			append_dev(a2, h43);
    			append_dev(ul, t12);
    			append_dev(ul, hr2);
    			append_dev(footer, t13);
    			append_dev(footer, div);
    			append_dev(div, p);
    			append_dev(div, t15);
    			append_dev(div, a3);
    			append_dev(a3, h44);
    			append_dev(a3, t17);
    			append_dev(a3, h45);
    			/*footer_binding*/ ctx[1](footer);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			/*footer_binding*/ ctx[1](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	let contact;
    	let iscontact = false;

    	function SetContact() {
    		contact.firstChild.addEventListener("click", () => {
    			$$invalidate(
    				0,
    				contact.style.transform = !iscontact
    				? "translate(-120%, -100%)"
    				: "translate(-120%, -2rem)",
    				contact
    			);

    			iscontact = iscontact ? false : true;
    		});
    	}

    	onMount(() => {
    		SetContact();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	function footer_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			contact = $$value;
    			$$invalidate(0, contact);
    		});
    	}

    	$$self.$capture_state = () => ({ onMount, contact, iscontact, SetContact });

    	$$self.$inject_state = $$props => {
    		if ('contact' in $$props) $$invalidate(0, contact = $$props.contact);
    		if ('iscontact' in $$props) iscontact = $$props.iscontact;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [contact, footer_binding];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.43.1 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t;
    	let contact;
    	let current;
    	header = new Header({ $$inline: true });
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(contact.$$.fragment);
    			add_location(main, file, 14, 0, 207);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t);
    			mount_component(contact, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(contact);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let menu_state;

    	menu_on.subscribe(value => {
    		menu_state = value;
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Contact, menu_on, menu_state });

    	$$self.$inject_state = $$props => {
    		if ('menu_state' in $$props) menu_state = $$props.menu_state;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=app.js.map
