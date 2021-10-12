<script>
import Header from "./Header.svelte";
import Contact from "./contact.svelte";
import About from "./About.svelte";

import {menu_on} from "./store.js";
let menu_state;

menu_on.subscribe(value => {
	menu_state = value;
})


</script>

<Header/>
<main>
	
	{#if menu_state === "about"}
		<About/>
	{/if}
	
</main>
<Contact/>

<style lang="scss">

	/* import base */
	@use 'styles/main' ;

	/* style */
	main{
		width: 100vw;
		height: 92%;
		color: main.$main-color1;
		margin-top: 10vh;
	}

	@media only screen and (min-width: 1030px) { 
 
	}
	@media only screen and (min-width: 515px) { 

	}

</style>