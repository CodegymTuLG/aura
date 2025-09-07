document.addEventListener("DOMContentLoaded", function () {
    const siteName = document.getElementById('sitename');
    siteName.innerHTML = 
        "Aura Orientalis";

    // 3 Introduce Content
    const heroTittle1 = document.getElementById('hero-title-1');
    heroTittle1.innerHTML = 
        "Creativity";

    const heroTittle1Content = document.getElementById('hero-title-1-content');
    heroTittle1Content.innerHTML = 
        "At Aura, creativity lies at the heart of everything we do. We believe in pushing boundaries, crafting elegant solutions that are both intuitive and impactful—because innovation is not just what we deliver; it's who we are.";

    const heroTittle2 = document.getElementById('hero-title-2');
    heroTittle2.innerHTML = 
        "Vision";

    const heroTittle2Content = document.getElementById('hero-title-2-content');
    heroTittle2Content.innerHTML = 
        "Our vision is to empower businesses, offices, and retail networks with seamless web and mobile experiences—so that every team, store, and café can thrive in a digitally connected world.";

    const heroTittle3 = document.getElementById('hero-title-3');
    heroTittle3.innerHTML = 
        "Customer Service";

    const heroTittle3Content = document.getElementById('hero-title-3-content');
    heroTittle3Content.innerHTML = 
        "We deliver personalized, high-touch support, ensuring every client—from SMEs to supermarket chains—feels heard, supported, and confident in our solutions.";

    // 4 Secondary Content
    const featuredServiceTitle1  = document.getElementById('featured-service-title-1');
    featuredServiceTitle1.innerHTML = 
        "Human Resources & Organizational Management";

    const featuredServiceTitle1Content  = document.getElementById('featured-service-title-1-content');
    featuredServiceTitle1Content.innerHTML = 
        "Streamline hiring, attendance, performance reviews, and employee data with integrated HR workflows.";

    const featuredServiceTitle2  = document.getElementById('featured-service-title-2');
    featuredServiceTitle2.innerHTML = 
        "Multi-Store Operations";

    const featuredServiceTitle2Content  = document.getElementById('featured-service-title-2-content');
    featuredServiceTitle2Content.innerHTML = 
        "Centralize operations—staffing, scheduling, inventory—across offices, cafés, and retail outlets for consistent oversight and efficiency.";

    const featuredServiceTitle3  = document.getElementById('featured-service-title-3');
    featuredServiceTitle3.innerHTML = 
        "Web & Mobile Platforms";

    const featuredServiceTitle3Content  = document.getElementById('featured-service-title-3-content');
    featuredServiceTitle3Content.innerHTML = 
        "Deliver tailored, user-friendly web and app solutions to enhance productivity and operational control uniquely designed for HR, organizational, and retail needs.";

    const featuredServiceTitle4  = document.getElementById('featured-service-title-4');
    featuredServiceTitle4.innerHTML = 
        "Customer Success & Strategic Support";

    const featuredServiceTitle4Content  = document.getElementById('featured-service-title-4-content');
    featuredServiceTitle4Content.innerHTML = 
        "Offer responsive, personalized service and strategic guidance ensuring your digital tools evolve confidently with your business.";

    // Read More Content
    const readMore = document.getElementById('read-more');
    readMore.innerHTML = `
        <h3>
            Where Technology Meets Imagination
        </h3>
        <p class="fst-italic">
            We transform innovative ideas into seamless digital solutions, connecting teams and empowering businesses to thrive.
        </p>
        <ul>
            <li><i class="bi bi-check2-all"></i> <span>Transforming Ideas into Reality</span></li>
            <li><i class="bi bi-check2-all"></i> <span>Fostering Creativity through Technology</span></li>
            <li><i class="bi bi-check2-all"></i> <span>Driving Innovation for Future Success</span></li>
        </ul>
        <p>
            At Aura, we are dedicated to transforming innovative ideas into impactful digital solutions. By seamlessly integrating creativity with cutting-edge technology, we empower businesses to achieve operational excellence and sustainable growth. We are committed to delivering solutions that not only meet but exceed our clients' expectations, fostering long-term partnerships built on trust and mutual success.
        </p>
    `;
    
    // Features Content
    const featuresSmallContent = document.getElementById('features-small-content');
    featuresSmallContent.innerHTML = 
        "Empowering Businesses with Intelligent Digital Solutions.";
    
    const featuresContent1 = document.getElementById('features-content-1');
    featuresContent1.innerHTML = `
        <h3>Comprehensive Digital Security Suite</h3>
        <p class="fst-italic">Aura offers an all-in-one digital security solution, integrating multiple protective features into a single platform.</p>
        <ul>
            <li><i class="bi bi-check"></i> <span> <strong>Password Management:</strong> Securely store and manage passwords.</span></li>
            <li><i class="bi bi-check"></i> <span> <strong>VPN & Antivirus:</strong> Protect online activities with VPN and antivirus tools.</span></li>
            <li><i class="bi bi-check"></i> <span> <strong>Identity Theft Protection:</strong> Monitor and safeguard against identity theft.</span></li>
        </ul>
    `;
    
    const featuresContent2 = document.getElementById('features-content-2');
    featuresContent2.innerHTML = `
        <h3>AI-Powered Parental Control</h3>
        <p class="fst-italic">Aura utilizes artificial intelligence to enhance parental control features, providing deeper insights into children's online activities.</p>
        <p>The AI-driven tools analyze online behavior patterns, enabling parents to monitor and manage their children's digital interactions effectively.</p>
    `;
    
    const featuresContent3 = document.getElementById('features-content-3');
    featuresContent3.innerHTML = `
        <h3>Advanced Health Monitoring Devices</h3>
        <p>Aura provides state-of-the-art health monitoring devices that seamlessly integrate with wearable technology.</p>
        <ul>
        <li><i class="bi bi-check"></i> <span>Body Composition Analysis: Assess fat, muscle, and water levels.</span></li>
        <li><i class="bi bi-check"></i> <span>Hydration Monitoring: Track hydration status.</span></li>
        <li><i class="bi bi-check"></i> <span>Integration with Health Platforms: Sync data with platforms like Apple HealthKit.</span>.</li>
        </ul>
    `;
    
    const featuresContent4 = document.getElementById('features-content-4');
    featuresContent4.innerHTML = `
        <h3>Seamless Digital Photo Sharing</h3>
        <p class="fst-italic">Aura's digital photo frames facilitate effortless sharing and viewing of photos.</p>
        <p>With features like unlimited storage and easy synchronization with cloud services, Aura's frames provide a modern solution for displaying and sharing memories.</p>
    `;


});