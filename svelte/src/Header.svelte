<script>
    import { onMount } from "svelte";
    import {menu_on} from "./store.js";

    // define entry points for dom elements
    let about, skills, projects;
    
    onMount(() => {
        about.addEventListener("click", () => {
            if (menu_on != "about"){
                menu_on.set("about")
            }
        });
        skills.addEventListener("click", () => {
            if (menu_on != "skills"){
                menu_on.set("skills")
            }
        });
        projects.addEventListener("click", () => {
            if (menu_on != "projects"){
                menu_on.set("projects")
            }
        });

    })
</script>

<header>
    <div class="content">
        <a href="/"><h2>Akif Sahin Korkmaz</h2></a>
        
        <div class="navigation">
            <nav>
                <ul>
                    <li>    <h4>About</h4>  <h4 bind:this={about}>About</h4>    </li>
                    <li>    <h4>Skills</h4> <h4 bind:this={skills}>Skills</h4>   </li>
                    <li>    <h4>Projects</h4>   <h4 bind:this={projects}>Projects</h4>   </li>
                </ul>
            </nav>
        </div>
    </div>


</header>

<style lang="scss">

/* import base */
@use 'styles/main' ;


/* style */
header{
    width: 100vw;
    height: 8vh;
    max-height: 100px;

    background: main.$main-color1;
}
.content{
    width: 100%;
    max-width: 2560x;

    min-height: 20px;
    height: 100%;
    max-height: 100px;

    position: relative;
    z-index: 2;
    margin: auto;
    padding: 0.8rem 10%;

    background: main.$main-color1;

    display: flex;
    align-items: center;
    justify-content: center;

    a{
        color: main.$main-color2; 
    }
    a:hover{
        text-decoration: none;
    }
}

.navigation{
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, 100%);

    height: 100%;

    width: 100%;
    max-width: 100vw;
    margin-left: auto;
}
.navigation::before, .navigation::after{
    content: " ";
    display: block;

    position: absolute;
    top: 10%;
    z-index: 6;
    height: 80%;
    width: 1.4rem;
}
.navigation::before{
    left: 0;
    /*
    background: linear-gradient(to left, rgba(main.$purple, 0.1) 40%, main.$purple   );
    */
    background: linear-gradient(to left, rgba(main.$main-color1, 0.1) 20%, main.$main-color1);
}
.navigation::after{
    right: 0;
    /*
    background: linear-gradient(to right, rgba(main.$purple, 0.1) 40%, main.$purple);
    */
    background: linear-gradient(to right, rgba(main.$main-color1, 0.1) 20%, main.$main-color1);
}

nav{
    height: 100%;
    width: 100%;

    /*    background: main.$purple; */ 
    background: main.$main-color1;
    border-top: 1px solid main.$main-color2;

    overflow: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
}
nav::-webkit-scrollbar {
    display: none;
}


nav ul{
    height: 100%;
    width: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    list-style: none;
}
li{
    padding: 0 1.6rem;
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


@media only screen and (min-width: 1030px) { 
    .content h2{
        white-space: nowrap;
    }
    .navigation {
        position: relative;
        top:0;
        left:0;
        transform: none;
        nav {
            background: none;
            border: none;

            ul{
                justify-content: flex-end;
            }
        }
    }
    .navigation::before, .navigation::after{
            display: none;
    } 
}
@media only screen and (min-width: 515px) { 
    nav ul{
        justify-content: space-around;
    }
}


</style>