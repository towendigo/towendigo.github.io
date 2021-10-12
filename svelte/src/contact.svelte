<script>
    import { onMount } from "svelte";

    // define entry points for dom elements
    let contact;
    let iscontact = false;

    function SetContact() {    
        contact.firstChild.addEventListener("click", () => {
            contact.style.transform = !iscontact ? "translate(-120%, -100%)" : "translate(-120%, -2rem)";
            iscontact = iscontact ? false : true ;
        });
    }

    onMount(() => {
        SetContact();

    })
</script>

<footer bind:this={contact}>
    <header class="contact-title"> <h4>Contact me</h4> </header> 
    <nav>
        <ul>
            <li><a href="/"> <img src="./static/git.png" alt="github-logo"> <h4> https://github.com/towendigo </h4> </a></li>
            <hr>
            <li><a href="/"> <img src="./static/in.png" alt="linkedin-logo"> <h4> https://www.linkedin.com/in/akif-sahin-korkmaz</h4> </a></li>
            <hr>
            <li><a href="/"> <img src="./static/mail.png" alt="e-mail"> <h4>akifsahinkorkmaz@outlook.com</h4> </a></li>
            <hr>
        </ul>
    </nav>
    
    <div class="resume">
        <p class="b">You can download my resume</p>
        <a href="./static/AKIF_SAHIN_KORKMAZ.pdf" download="Akif_Sahin_Korkmaz_CV"> <h4> My Resume </h4> <h4> My Resume </h4> </a>
    </div>
    
</footer>


<style lang="scss">

/* import base */
@use 'styles/main' ;


/* style */

footer{
    width: 100vw;
    background: main.$main-color2;
    
    position: fixed;
    top: 100vh;
    left: 120%;
    transform: translate(-120%, -2rem);
    transition: transform 0.4s ease ;

    min-height: 40%;
    box-shadow: 0px 2px 6px 2px main.$purple;

    header{
        position: relative;
        width: 100%;
        height: 2rem;

        background-color: main.$main-color1;

        cursor: pointer;

        h4{
            position: absolute;
            z-index: 5;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            color : main.$main-color2;
            transition: transform 0.2s ease, color 0.4s ease-out 0.1s;
        }
    }
    header:hover h4{
        color: main.$yellow;
        transform: translate(-50%, -50%) scale(130%);
    }

    nav ul{
        list-style: none;
        overflow: hidden;

        hr{
            width: 80%;
            margin: 0 auto;
        }
        li a{
            position: relative;
            margin: 1.2rem 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            
            color: main.$main-color1;

            h4{
                width: 80%;
                word-wrap: break-word;
            }
            img{
                margin-right: 1rem;
                width: 1.4rem;
                height: auto;
                object-fit: contain;
            }
        }

    }

    .resume{
        margin-top: 1rem;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;

        a{
            margin: 1rem 0;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            background: main.$purple;
            color: main.$main-color2; 
            position: relative;

            h4{
                opacity: 0;
            }
            h4 + h4{
                position: absolute;
                z-index: 5;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);

                opacity: 1;
                white-space: nowrap;
                color : main.$main-color2;
                transition: transform 0.2s ease;
            }
        }
        a:hover h4{
            text-decoration: none;
            transform: translate(-50%, -50%) scale(110%);
        }
        
    }
}

@media only screen and (min-width: 1030px) { 
    footer{
        left: 100%;
        transform: translate(-120%, -2rem);
        min-width: 200px;
        width: 25%;
        max-width: 500px;
    }
}
@media only screen and (min-width: 515px) { 
    nav ul{
        justify-content: space-around;
    }
}


/*
footer{
    min-width: 200px;
    width: 25%;
    max-width: 500px;
    position: absolute;
    top: 100%;
    left: 100%;
    transform: translate(-120%, -3rem);

    transition: transform 0.4s ease ;

    min-height: 40%;
    box-shadow: 0px 2px 6px 2px main.$purple;

    header{
        position: relative;
        width: 100%;
        height: 3rem;

        background-color: main.$main-color1;

        cursor: pointer;

        h4{
            position: absolute;
            z-index: 5;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            color : main.$main-color2;
            transition: transform 0.2s ease, color 0.4s ease-out 0.1s;
        }
    }
    header:hover h4{
        color: main.$yellow;
        transform: translate(-50%, -50%) scale(130%);
    }

    nav ul{
        list-style: none;
        overflow: hidden;

        hr{
            width: 80%;
            margin: 0 auto;
        }
        li a{
            position: relative;
            margin: 1.2rem 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            
            color: main.$main-color1;

            h4{
                width: 80%;
                text-overflow: ellipsis;
            }
            img{
                margin-right: 1rem;
                width: 2.4rem;
                height: auto;
                object-fit: contain;
            }
        }

    }

    .resume{
        margin-top: 1rem;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;

        a{
            margin: 1rem 0;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            background: main.$purple;
            color: main.$main-color2; 
            position: relative;

            h4{
                opacity: 0;
            }
            h4 + h4{
                position: absolute;
                z-index: 5;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);

                opacity: 1;
                white-space: nowrap;
                color : main.$main-color2;
                transition: transform 0.2s ease;
            }
        }
        a:hover h4{
            text-decoration: none;
            transform: translate(-50%, -50%) scale(110%);
        }
        
    }
}
*/

</style>