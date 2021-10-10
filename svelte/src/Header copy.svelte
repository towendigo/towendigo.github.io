<script>
    import { onMount } from "svelte";

    // define entry points for dom elements
    let about, prog_skls, othr_skls, projects;

    onMount(() => {


    })
</script>

<header>
    <div class="content">
        <a href="/"><h1>Akif Sahin Korkmaz</h1></a>
        
        <nav>
            <ul>
                <li>    <h4>About</h4>  <h4 bind:this={about}>About</h4>    </li>
                <li>    <h4>Programming Skills</h4> <h4 bind:this={prog_skls}>Programming Skills</h4>   </li>
                <li>    <h4>Other Skills</h4>   <h4 bind:this={othr_skls}>Other Skills</h4>   </li>
                <li>    <h4>Projects</h4>   <h4 bind:this={projects}>Projects</h4>   </li>
            </ul>
        </nav>
    </div>


</header>

<style lang="scss">

/* import base */
@use 'styles/main' ;




/* style */

@media only screen and (max-width: 1030px) { 
    nav ul li {
        margin: 0 0.5rem;
        padding: 0 0.5rem;
    }
}

header{
    width: 100vw;
    height: 10vh;
    max-height: 100px;

    background: main.$main-color1;
}
.content{
    width: 100%;
    max-width: 2560x;

    min-height: 20px;
    height: 100%;
    max-height: 100px;

    margin: auto;
    padding: 0 10%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    a{
        color: main.$main-color2; 
    }
    a:hover{
        text-decoration: none;
    }
}
nav {
    height: 100%;
}
nav ul{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    list-style: none;
}
li{
    margin: 0 0.8rem;
    padding: 0 0.8rem;
    position: relative;
}
li > h4{
    white-space: nowrap;
    text-align: center;
    opacity: 0;
}

li > h4 + h4{ 
    position: absolute;
    z-index: 5;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
                
    white-space: nowrap;
    text-align: center;
    opacity: 1;
    color: main.$main-color2;

    transition: transform 0.2s ease, color 0.4s ease-out 0.1s;

    cursor: pointer;
}
li > h4 + h4:hover{
    color: main.$yellow;
    transform: translate(-50%, -50%) scale(130%);
}



</style>