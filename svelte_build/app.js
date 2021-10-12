
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    const file$3 = "src\\Header.svelte";

    function create_fragment$3(ctx) {
    	let header;
    	let div1;
    	let a;
    	let h2;
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
    			h2 = element("h2");
    			h2.textContent = "Akif Sahin Korkmaz";
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
    			attr_dev(h2, "class", "svelte-b6ucvh");
    			add_location(h2, file$3, 29, 20, 749);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-b6ucvh");
    			add_location(a, file$3, 29, 8, 737);
    			attr_dev(h40, "class", "svelte-b6ucvh");
    			add_location(h40, file$3, 34, 28, 895);
    			attr_dev(h41, "class", "svelte-b6ucvh");
    			add_location(h41, file$3, 34, 44, 911);
    			attr_dev(li0, "class", "svelte-b6ucvh");
    			add_location(li0, file$3, 34, 20, 887);
    			attr_dev(h42, "class", "svelte-b6ucvh");
    			add_location(h42, file$3, 35, 28, 982);
    			attr_dev(h43, "class", "svelte-b6ucvh");
    			add_location(h43, file$3, 35, 44, 998);
    			attr_dev(li1, "class", "svelte-b6ucvh");
    			add_location(li1, file$3, 35, 20, 974);
    			attr_dev(h44, "class", "svelte-b6ucvh");
    			add_location(h44, file$3, 36, 28, 1070);
    			attr_dev(h45, "class", "svelte-b6ucvh");
    			add_location(h45, file$3, 36, 48, 1090);
    			attr_dev(li2, "class", "svelte-b6ucvh");
    			add_location(li2, file$3, 36, 20, 1062);
    			attr_dev(ul, "class", "svelte-b6ucvh");
    			add_location(ul, file$3, 33, 16, 861);
    			attr_dev(nav, "class", "svelte-b6ucvh");
    			add_location(nav, file$3, 32, 12, 838);
    			attr_dev(div0, "class", "navigation svelte-b6ucvh");
    			add_location(div0, file$3, 31, 8, 800);
    			attr_dev(div1, "class", "content svelte-b6ucvh");
    			add_location(div1, file$3, 28, 4, 706);
    			attr_dev(header, "class", "svelte-b6ucvh");
    			add_location(header, file$3, 27, 0, 692);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, a);
    			append_dev(a, h2);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\contact.svelte generated by Svelte v3.43.1 */
    const file$2 = "src\\contact.svelte";

    function create_fragment$2(ctx) {
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
    			attr_dev(h40, "class", "svelte-nnjt76");
    			add_location(h40, file$2, 21, 35, 552);
    			attr_dev(header, "class", "contact-title svelte-nnjt76");
    			add_location(header, file$2, 21, 4, 521);
    			if (!src_url_equal(img0.src, img0_src_value = "./static/git.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "github-logo");
    			attr_dev(img0, "class", "svelte-nnjt76");
    			add_location(img0, file$2, 24, 29, 638);
    			attr_dev(h41, "class", "svelte-nnjt76");
    			add_location(h41, file$2, 24, 76, 685);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-nnjt76");
    			add_location(a0, file$2, 24, 16, 625);
    			add_location(li0, file$2, 24, 12, 621);
    			attr_dev(hr0, "class", "svelte-nnjt76");
    			add_location(hr0, file$2, 25, 12, 748);
    			if (!src_url_equal(img1.src, img1_src_value = "./static/in.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "linkedin-logo");
    			attr_dev(img1, "class", "svelte-nnjt76");
    			add_location(img1, file$2, 26, 29, 783);
    			attr_dev(h42, "class", "svelte-nnjt76");
    			add_location(h42, file$2, 26, 77, 831);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "svelte-nnjt76");
    			add_location(a1, file$2, 26, 16, 770);
    			add_location(li1, file$2, 26, 12, 766);
    			attr_dev(hr1, "class", "svelte-nnjt76");
    			add_location(hr1, file$2, 27, 12, 911);
    			if (!src_url_equal(img2.src, img2_src_value = "./static/mail.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "e-mail");
    			attr_dev(img2, "class", "svelte-nnjt76");
    			add_location(img2, file$2, 28, 29, 946);
    			attr_dev(h43, "class", "svelte-nnjt76");
    			add_location(h43, file$2, 28, 72, 989);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "svelte-nnjt76");
    			add_location(a2, file$2, 28, 16, 933);
    			add_location(li2, file$2, 28, 12, 929);
    			attr_dev(hr2, "class", "svelte-nnjt76");
    			add_location(hr2, file$2, 29, 12, 1050);
    			attr_dev(ul, "class", "svelte-nnjt76");
    			add_location(ul, file$2, 23, 8, 603);
    			attr_dev(nav, "class", "svelte-nnjt76");
    			add_location(nav, file$2, 22, 4, 588);
    			attr_dev(p, "class", "b");
    			add_location(p, file$2, 34, 8, 1123);
    			attr_dev(h44, "class", "svelte-nnjt76");
    			add_location(h44, file$2, 35, 84, 1252);
    			attr_dev(h45, "class", "svelte-nnjt76");
    			add_location(h45, file$2, 35, 105, 1273);
    			attr_dev(a3, "href", "./static/AKIF_SAHIN_KORKMAZ.pdf");
    			attr_dev(a3, "download", "Akif_Sahin_Korkmaz_CV");
    			attr_dev(a3, "class", "svelte-nnjt76");
    			add_location(a3, file$2, 35, 8, 1176);
    			attr_dev(div, "class", "resume svelte-nnjt76");
    			add_location(div, file$2, 33, 4, 1093);
    			attr_dev(footer, "class", "svelte-nnjt76");
    			add_location(footer, file$2, 20, 0, 487);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\About.svelte generated by Svelte v3.43.1 */

    const file$1 = "src\\About.svelte";

    function create_fragment$1(ctx) {
    	let div6;
    	let section0;
    	let p0;
    	let t1;
    	let div0;
    	let h10;
    	let t3;
    	let h30;
    	let t5;
    	let p1;
    	let t7;
    	let section1;
    	let p2;
    	let t9;
    	let div1;
    	let h11;
    	let t11;
    	let h31;
    	let t13;
    	let p3;
    	let t15;
    	let h32;
    	let t17;
    	let p4;
    	let t19;
    	let h33;
    	let t21;
    	let p5;
    	let t23;
    	let section2;
    	let p6;
    	let t25;
    	let div2;
    	let h12;
    	let t27;
    	let h34;
    	let t29;
    	let ul0;
    	let li0;
    	let p7;
    	let t31;
    	let li1;
    	let p8;
    	let t33;
    	let h35;
    	let t35;
    	let ul1;
    	let li2;
    	let p9;
    	let t37;
    	let li3;
    	let p10;
    	let t39;
    	let li4;
    	let p11;
    	let t41;
    	let li5;
    	let p12;
    	let t43;
    	let li6;
    	let p13;
    	let t45;
    	let section3;
    	let p14;
    	let t47;
    	let div3;
    	let h13;
    	let t49;
    	let h36;
    	let t51;
    	let p15;
    	let t53;
    	let h37;
    	let t55;
    	let p16;
    	let t57;
    	let h38;
    	let t59;
    	let p17;
    	let t61;
    	let section4;
    	let p18;
    	let t63;
    	let div5;
    	let h14;
    	let t65;
    	let h39;
    	let t67;
    	let p19;
    	let t69;
    	let div4;
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			section0 = element("section");
    			p0 = element("p");
    			p0.textContent = "#AboutMe";
    			t1 = space();
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Akif Sahin Korkmaz";
    			t3 = space();
    			h30 = element("h3");
    			h30.textContent = "Full Stack Web Developer";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "I have had great interest in programming and finance for many years. I am a good team player with excellent verbal and written communicational skills. I am currently looking for a position in which i can utilise my skills.";
    			t7 = space();
    			section1 = element("section");
    			p2 = element("p");
    			p2.textContent = "#Languages";
    			t9 = space();
    			div1 = element("div");
    			h11 = element("h1");
    			h11.textContent = "I Speak ~";
    			t11 = space();
    			h31 = element("h3");
    			h31.textContent = "Turkish";
    			t13 = space();
    			p3 = element("p");
    			p3.textContent = "I am a native Turkish speaker.";
    			t15 = space();
    			h32 = element("h3");
    			h32.textContent = "English";
    			t17 = space();
    			p4 = element("p");
    			p4.textContent = "I speak English since high-school. I have advanced verbal and communicational skills in English.";
    			t19 = space();
    			h33 = element("h3");
    			h33.textContent = "Russian";
    			t21 = space();
    			p5 = element("p");
    			p5.textContent = "I am a beginner in Russian.";
    			t23 = space();
    			section2 = element("section");
    			p6 = element("p");
    			p6.textContent = "#Education";
    			t25 = space();
    			div2 = element("div");
    			h12 = element("h1");
    			h12.textContent = "I Attended ~";
    			t27 = space();
    			h34 = element("h3");
    			h34.textContent = "Asfa Science High School | 2014-2018";
    			t29 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			p7 = element("p");
    			p7.textContent = "1st place with project about accessibility at Lego League in Ankara";
    			t31 = space();
    			li1 = element("li");
    			p8 = element("p");
    			p8.textContent = "Participated at national science competitions (TUBITAK).";
    			t33 = space();
    			h35 = element("h3");
    			h35.textContent = "Ankara University - Veterinary Faculty | 2018-Present";
    			t35 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			p9 = element("p");
    			p9.textContent = "Volunteering about stray animals.";
    			t37 = space();
    			li3 = element("li");
    			p10 = element("p");
    			p10.textContent = "Volunteering at Disaster and Emergency Management Presidency (AFAD).";
    			t39 = space();
    			li4 = element("li");
    			p11 = element("p");
    			p11.textContent = "1st stage's winner with micro-mobility project at U4S startup growth programme in Ankara.";
    			t41 = space();
    			li5 = element("li");
    			p12 = element("p");
    			p12.textContent = "Worked about same micro-mobility project in Gazi University Technology Transfer Office.";
    			t43 = space();
    			li6 = element("li");
    			p13 = element("p");
    			p13.textContent = "Freelanced as a full stack web developer.";
    			t45 = space();
    			section3 = element("section");
    			p14 = element("p");
    			p14.textContent = "#MyInterests";
    			t47 = space();
    			div3 = element("div");
    			h13 = element("h1");
    			h13.textContent = "I Am Interested In ~";
    			t49 = space();
    			h36 = element("h3");
    			h36.textContent = "Programming";
    			t51 = space();
    			p15 = element("p");
    			p15.textContent = "I like learning new technologies, using them in projects. I really like seeing something i contributed live. I also like solving problems. That sums up my interest in programming.";
    			t53 = space();
    			h37 = element("h3");
    			h37.textContent = "Music";
    			t55 = space();
    			p16 = element("p");
    			p16.textContent = "I am a big fan of music. Also play guitar. My music taste varies between today's pop and 70s' rock.";
    			t57 = space();
    			h38 = element("h3");
    			h38.textContent = "Animals";
    			t59 = space();
    			p17 = element("p");
    			p17.textContent = "I love animals, specifically cats. I am a volunteer stray animal feeder.";
    			t61 = space();
    			section4 = element("section");
    			p18 = element("p");
    			p18.textContent = "#MyResume";
    			t63 = space();
    			div5 = element("div");
    			h14 = element("h1");
    			h14.textContent = "My Resume";
    			t65 = space();
    			h39 = element("h3");
    			h39.textContent = "For more information ~";
    			t67 = space();
    			p19 = element("p");
    			p19.textContent = "You can contact me or download my resume by clicking the image.";
    			t69 = space();
    			div4 = element("div");
    			a = element("a");
    			img = element("img");
    			attr_dev(p0, "class", "secret svelte-5arbjo");
    			add_location(p0, file$1, 6, 8, 74);
    			attr_dev(h10, "class", "svelte-5arbjo");
    			add_location(h10, file$1, 10, 12, 173);
    			attr_dev(h30, "class", "svelte-5arbjo");
    			add_location(h30, file$1, 11, 12, 214);
    			attr_dev(p1, "class", "b svelte-5arbjo");
    			add_location(p1, file$1, 12, 12, 261);
    			attr_dev(div0, "class", "content svelte-5arbjo");
    			add_location(div0, file$1, 9, 8, 138);
    			attr_dev(section0, "id", "me");
    			attr_dev(section0, "class", "svelte-5arbjo");
    			add_location(section0, file$1, 5, 4, 47);
    			attr_dev(p2, "class", "secret svelte-5arbjo");
    			add_location(p2, file$1, 17, 8, 569);
    			attr_dev(h11, "class", "svelte-5arbjo");
    			add_location(h11, file$1, 21, 12, 670);
    			attr_dev(h31, "class", "svelte-5arbjo");
    			add_location(h31, file$1, 22, 12, 702);
    			attr_dev(p3, "class", "b svelte-5arbjo");
    			add_location(p3, file$1, 23, 12, 732);
    			attr_dev(h32, "class", "svelte-5arbjo");
    			add_location(h32, file$1, 25, 12, 807);
    			attr_dev(p4, "class", "b svelte-5arbjo");
    			add_location(p4, file$1, 26, 12, 837);
    			attr_dev(h33, "class", "svelte-5arbjo");
    			add_location(h33, file$1, 28, 12, 978);
    			attr_dev(p5, "class", "b svelte-5arbjo");
    			add_location(p5, file$1, 29, 12, 1008);
    			attr_dev(div1, "class", "content svelte-5arbjo");
    			add_location(div1, file$1, 20, 8, 635);
    			attr_dev(section1, "id", "lans");
    			attr_dev(section1, "class", "svelte-5arbjo");
    			add_location(section1, file$1, 16, 4, 540);
    			attr_dev(p6, "class", "secret svelte-5arbjo");
    			add_location(p6, file$1, 35, 8, 1146);
    			attr_dev(h12, "class", "svelte-5arbjo");
    			add_location(h12, file$1, 39, 12, 1247);
    			attr_dev(h34, "class", "svelte-5arbjo");
    			add_location(h34, file$1, 40, 12, 1282);
    			attr_dev(p7, "class", "b svelte-5arbjo");
    			add_location(p7, file$1, 42, 20, 1367);
    			attr_dev(li0, "class", "svelte-5arbjo");
    			add_location(li0, file$1, 42, 16, 1363);
    			attr_dev(p8, "class", "b svelte-5arbjo");
    			add_location(p8, file$1, 43, 20, 1491);
    			attr_dev(li1, "class", "svelte-5arbjo");
    			add_location(li1, file$1, 43, 16, 1487);
    			attr_dev(ul0, "class", "svelte-5arbjo");
    			add_location(ul0, file$1, 41, 12, 1341);
    			attr_dev(h35, "class", "svelte-5arbjo");
    			add_location(h35, file$1, 45, 12, 1634);
    			attr_dev(p9, "class", "b svelte-5arbjo");
    			add_location(p9, file$1, 47, 20, 1736);
    			attr_dev(li2, "class", "svelte-5arbjo");
    			add_location(li2, file$1, 47, 16, 1732);
    			attr_dev(p10, "class", "b svelte-5arbjo");
    			add_location(p10, file$1, 48, 20, 1826);
    			attr_dev(li3, "class", "svelte-5arbjo");
    			add_location(li3, file$1, 48, 16, 1822);
    			attr_dev(p11, "class", "b svelte-5arbjo");
    			add_location(p11, file$1, 49, 20, 1951);
    			attr_dev(li4, "class", "svelte-5arbjo");
    			add_location(li4, file$1, 49, 16, 1947);
    			attr_dev(p12, "class", "b svelte-5arbjo");
    			add_location(p12, file$1, 50, 20, 2097);
    			attr_dev(li5, "class", "svelte-5arbjo");
    			add_location(li5, file$1, 50, 16, 2093);
    			attr_dev(p13, "class", "b svelte-5arbjo");
    			add_location(p13, file$1, 51, 20, 2241);
    			attr_dev(li6, "class", "svelte-5arbjo");
    			add_location(li6, file$1, 51, 16, 2237);
    			attr_dev(ul1, "class", "svelte-5arbjo");
    			add_location(ul1, file$1, 46, 12, 1710);
    			attr_dev(div2, "class", "content svelte-5arbjo");
    			add_location(div2, file$1, 38, 8, 1212);
    			attr_dev(section2, "id", "edu");
    			attr_dev(section2, "class", "svelte-5arbjo");
    			add_location(section2, file$1, 34, 4, 1118);
    			attr_dev(p14, "class", "secret svelte-5arbjo");
    			add_location(p14, file$1, 57, 8, 2430);
    			attr_dev(h13, "class", "svelte-5arbjo");
    			add_location(h13, file$1, 61, 12, 2533);
    			attr_dev(h36, "class", "svelte-5arbjo");
    			add_location(h36, file$1, 62, 12, 2576);
    			attr_dev(p15, "class", "b svelte-5arbjo");
    			add_location(p15, file$1, 63, 12, 2610);
    			attr_dev(h37, "class", "svelte-5arbjo");
    			add_location(h37, file$1, 65, 12, 2835);
    			attr_dev(p16, "class", "b svelte-5arbjo");
    			add_location(p16, file$1, 66, 12, 2863);
    			attr_dev(h38, "class", "svelte-5arbjo");
    			add_location(h38, file$1, 68, 12, 2995);
    			attr_dev(p17, "class", "b svelte-5arbjo");
    			add_location(p17, file$1, 69, 12, 3025);
    			attr_dev(div3, "class", "content svelte-5arbjo");
    			add_location(div3, file$1, 60, 8, 2498);
    			attr_dev(section3, "id", "interests");
    			attr_dev(section3, "class", "svelte-5arbjo");
    			add_location(section3, file$1, 56, 4, 2396);
    			attr_dev(p18, "class", "secret svelte-5arbjo");
    			add_location(p18, file$1, 74, 8, 3181);
    			attr_dev(h14, "class", "svelte-5arbjo");
    			add_location(h14, file$1, 78, 12, 3281);
    			attr_dev(h39, "class", "svelte-5arbjo");
    			add_location(h39, file$1, 79, 12, 3313);
    			attr_dev(p19, "class", "b svelte-5arbjo");
    			add_location(p19, file$1, 80, 12, 3358);
    			if (!src_url_equal(img.src, img_src_value = "./static/Akif_Sahin_Korkmaz.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Akif_Sahin_Korkmaz_CV");
    			attr_dev(img, "class", "svelte-5arbjo");
    			add_location(img, file$1, 84, 20, 3590);
    			attr_dev(a, "href", "./static/AKIF_SAHIN_KORKMAZ.pdf");
    			attr_dev(a, "download", "Akif_Sahin_Korkmaz_CV");
    			attr_dev(a, "class", "svelte-5arbjo");
    			add_location(a, file$1, 83, 16, 3492);
    			attr_dev(div4, "class", "resume svelte-5arbjo");
    			add_location(div4, file$1, 82, 12, 3454);
    			attr_dev(div5, "class", "content svelte-5arbjo");
    			add_location(div5, file$1, 77, 8, 3246);
    			attr_dev(section4, "id", "cv");
    			attr_dev(section4, "class", "svelte-5arbjo");
    			add_location(section4, file$1, 73, 4, 3154);
    			attr_dev(div6, "id", "About");
    			add_location(div6, file$1, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, section0);
    			append_dev(section0, p0);
    			append_dev(section0, t1);
    			append_dev(section0, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t3);
    			append_dev(div0, h30);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(div6, t7);
    			append_dev(div6, section1);
    			append_dev(section1, p2);
    			append_dev(section1, t9);
    			append_dev(section1, div1);
    			append_dev(div1, h11);
    			append_dev(div1, t11);
    			append_dev(div1, h31);
    			append_dev(div1, t13);
    			append_dev(div1, p3);
    			append_dev(div1, t15);
    			append_dev(div1, h32);
    			append_dev(div1, t17);
    			append_dev(div1, p4);
    			append_dev(div1, t19);
    			append_dev(div1, h33);
    			append_dev(div1, t21);
    			append_dev(div1, p5);
    			append_dev(div6, t23);
    			append_dev(div6, section2);
    			append_dev(section2, p6);
    			append_dev(section2, t25);
    			append_dev(section2, div2);
    			append_dev(div2, h12);
    			append_dev(div2, t27);
    			append_dev(div2, h34);
    			append_dev(div2, t29);
    			append_dev(div2, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, p7);
    			append_dev(ul0, t31);
    			append_dev(ul0, li1);
    			append_dev(li1, p8);
    			append_dev(div2, t33);
    			append_dev(div2, h35);
    			append_dev(div2, t35);
    			append_dev(div2, ul1);
    			append_dev(ul1, li2);
    			append_dev(li2, p9);
    			append_dev(ul1, t37);
    			append_dev(ul1, li3);
    			append_dev(li3, p10);
    			append_dev(ul1, t39);
    			append_dev(ul1, li4);
    			append_dev(li4, p11);
    			append_dev(ul1, t41);
    			append_dev(ul1, li5);
    			append_dev(li5, p12);
    			append_dev(ul1, t43);
    			append_dev(ul1, li6);
    			append_dev(li6, p13);
    			append_dev(div6, t45);
    			append_dev(div6, section3);
    			append_dev(section3, p14);
    			append_dev(section3, t47);
    			append_dev(section3, div3);
    			append_dev(div3, h13);
    			append_dev(div3, t49);
    			append_dev(div3, h36);
    			append_dev(div3, t51);
    			append_dev(div3, p15);
    			append_dev(div3, t53);
    			append_dev(div3, h37);
    			append_dev(div3, t55);
    			append_dev(div3, p16);
    			append_dev(div3, t57);
    			append_dev(div3, h38);
    			append_dev(div3, t59);
    			append_dev(div3, p17);
    			append_dev(div6, t61);
    			append_dev(div6, section4);
    			append_dev(section4, p18);
    			append_dev(section4, t63);
    			append_dev(section4, div5);
    			append_dev(div5, h14);
    			append_dev(div5, t65);
    			append_dev(div5, h39);
    			append_dev(div5, t67);
    			append_dev(div5, p19);
    			append_dev(div5, t69);
    			append_dev(div5, div4);
    			append_dev(div4, a);
    			append_dev(a, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.43.1 */
    const file = "src\\App.svelte";

    // (19:1) {#if menu_state === "about"}
    function create_if_block(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(19:1) {#if menu_state === \\\"about\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let contact;
    	let current;
    	header = new Header({ $$inline: true });
    	let if_block = /*menu_state*/ ctx[0] === "about" && create_if_block(ctx);
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(contact.$$.fragment);
    			attr_dev(main, "class", "svelte-870jd1");
    			add_location(main, file, 16, 0, 269);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			insert_dev(target, t1, anchor);
    			mount_component(contact, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*menu_state*/ ctx[0] === "about") {
    				if (if_block) {
    					if (dirty & /*menu_state*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t1);
    			destroy_component(contact, detaching);
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
    		$$invalidate(0, menu_state = value);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Contact,
    		About,
    		menu_on,
    		menu_state
    	});

    	$$self.$inject_state = $$props => {
    		if ('menu_state' in $$props) $$invalidate(0, menu_state = $$props.menu_state);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menu_state];
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
