<script>

</script>

<div id="About">
    <section id="me">
        <p class="secret">
            #AboutMe
        </p>
        <div class="content">
            <h1>Akif Sahin Korkmaz</h1>
            <h3>Full Stack Web Developer</h3>
            <p class="b">I have had great interest in programming and finance for many years. I am a good team player with excellent verbal and written communicational skills. I am currently looking for a position in which i can utilise my skills.</p>

        </div>
    </section>
    <section id="lans">
        <p class="secret">
            #Languages
        </p>
        <div class="content">
            <h1>I Speak ~</h1>
            <h3>Turkish</h3>
            <p class="b">I am a native Turkish speaker.</p>
            
            <h3>English</h3>
            <p class="b">I speak English since high-school. I have advanced verbal and communicational skills in English.</p>
            
            <h3>Russian</h3>
            <p class="b">I am a beginner in Russian.</p>
            
            
        </div>
    </section>
    <section id="edu">
        <p class="secret">
            #Education
        </p>
        <div class="content">
            <h1>I Attended ~</h1>
            <h3>Asfa Science High School | 2014-2018</h3>
            <ul>
                <li><p class="b">1st place with project about accessibility at Lego League in Ankara</p></li>             
                <li><p class="b">Participated at national science competitions (TUBITAK).</p></li>                                
            </ul>
            <h3>Ankara University - Veterinary Faculty | 2018-Present</h3>
            <ul>
                <li><p class="b">Volunteering about stray animals.</p></li>             
                <li><p class="b">Volunteering at Disaster and Emergency Management Presidency (AFAD).</p></li>             
                <li><p class="b">1st stage's winner with micro-mobility project at U4S startup growth programme in Ankara.</p></li>             
                <li><p class="b">Worked about same micro-mobility project in Gazi University Technology Transfer Office.</p></li>             
                <li><p class="b">Freelanced as a full stack web developer.</p></li>                     
            </ul>
            
        </div>
    </section>
    <section id="interests">
        <p class="secret">
            #MyInterests
        </p>
        <div class="content">
            <h1>I Am Interested In ~</h1>
            <h3>Programming</h3>
            <p class="b">I like learning new technologies, using them in projects. I really like seeing something i contributed live. I also like solving problems. That sums up my interest in programming. </p>
            
            <h3>Music</h3>
            <p class="b">I am a big fan of music. Also play guitar. My music taste varies between today's pop and 70s' rock.</p>

            <h3>Animals</h3>
            <p class="b">I love animals, specifically cats. I am a volunteer stray animal feeder.</p>

        </div>
    </section>
    <section id="cv">
        <p class="secret">
            #MyResume
        </p>
        <div class="content">
            <h1>My Resume</h1>
            <h3>For more information ~</h3>
            <p class="b">You can contact me or download my resume by clicking the image.</p>

            <div class="resume">
                <a href="./static/AKIF_SAHIN_KORKMAZ.pdf" download="Akif_Sahin_Korkmaz_CV"> 
                    <img src="./static/Akif_Sahin_Korkmaz.jpg" alt="Akif_Sahin_Korkmaz_CV">
                </a>
            </div>
        </div>
    </section>
</div>


<style lang="scss">

/* import base */
@use 'styles/main' ;

/* style */
section{
    min-width: 50%;
    width: 100%;
    padding: 3rem 1rem;

    h1, h3, p{
        margin: 0.5rem;
    }
    h1{
        margin-top: 0;
        margin-bottom: 2rem;
    }
    h3{
        margin-bottom: 1rem;
    }
    p{
        margin-bottom: 2rem;
    }
    ul{
        padding-left: 1.5rem;
        margin: 0.5rem;
        margin-bottom: 2rem;
        *{
            margin: 0.4rem 0;
        }
    }
    p.secret{
        width: 100%;
        margin-right: auto;

        font-size: 2.4rem;
        font-weight: 900;
        font-style: italic;
        letter-spacing: 0.2rem;
        
        opacity: 0.1;
    }
}

#cv{
    a{
        display: block;
        width: 80%;
        margin: 0 auto;
        position: relative;
        box-shadow: 0px 2px 6px 2px main.$purple;

        img{
            width: 100%;
            height: auto;
            object-fit: contain;
        }
    }
}






</style>