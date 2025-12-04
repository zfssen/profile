

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'projects', 'awards']


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    const timestamp = new Date().getTime();
    fetch(content_dir + config_file + '?t=' + timestamp)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md?t=' + timestamp)
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                const container = document.getElementById(name + '-md');
                container.innerHTML = html;
                
                // Post-processing for beautification
                if (name === 'projects') {
                    // Wrap projects in cards
                    const children = Array.from(container.children);
                    const newContainer = document.createElement('div');
                    let currentCard = null;
                    
                    children.forEach(child => {
                        if (child.tagName === 'H3') {
                            currentCard = document.createElement('div');
                            currentCard.className = 'project-card shadow-sm';
                            newContainer.appendChild(currentCard);
                        }
                        if (currentCard) {
                            currentCard.appendChild(child);
                        } else {
                            // Content before the first H3 (if any)
                            newContainer.appendChild(child);
                        }
                    });
                    if (newContainer.children.length > 0) {
                        container.innerHTML = '';
                        container.appendChild(newContainer);
                    }
                } else if (name === 'awards') {
                    // Style the awards list
                    const uls = container.querySelectorAll('ul');
                    uls.forEach(ul => {
                        ul.className = 'award-list';
                        const lis = ul.querySelectorAll('li');
                        lis.forEach(li => {
                            li.innerHTML = '<div class="award-item shadow-sm">' + li.innerHTML + '</div>';
                        });
                    });
                }

            }).then(() => {
                // MathJax
                if (window.MathJax) MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 
