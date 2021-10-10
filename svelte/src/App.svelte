<script>
import Header from "./Header.svelte";
import Contact from "./contact.svelte";

import {menu_on} from "./store.js";
let menu_state;

menu_on.subscribe(value => {
	menu_state = value;
})


</script>

<main>
	<Header/>

	<Contact/>
</main>


<style lang="scss">

</style>