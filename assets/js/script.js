$(document).ready(function() {
  // Initialize variables
  let jobData = [];
  let filteredJobs = [];
  let currentUser = null;
  
  // Check if user is logged in from local storage
  function checkAuth() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
      updateUIForLoggedInUser();
    } else {
      updateUIForLoggedOutUser();
    }
  }
  
  // Update UI elements based on authentication status
  function updateUIForLoggedInUser() {
    $('.logged-out-only').hide();
    $('.logged-in-only').show();
    $('.user-name').text(currentUser.name);
    
    // Show appropriate dashboard link based on user type
    if (currentUser.role === 'employer') {
      $('.employer-only').show();
      $('.jobseeker-only').hide();
    } else if (currentUser.role === 'jobseeker') {
      $('.employer-only').hide();
      $('.jobseeker-only').show();
    }
  }
  
  function updateUIForLoggedOutUser() {
    $('.logged-out-only').show();
    $('.logged-in-only').hide();
    $('.employer-only, .jobseeker-only').hide();
  }
  
  // Handle the navbar transparency and scroll effect
  function handleNavbarTransparency() {
    const header = $('.header');
    if (header.hasClass('transparent')) {
      $(window).on('scroll', function() {
        if ($(window).scrollTop() > 50) {
          header.addClass('scrolled');
        } else {
          header.removeClass('scrolled');
        }
      });
      
      // Trigger once on page load
      if ($(window).scrollTop() > 50) {
        header.addClass('scrolled');
      }
    }
  }
  
  // Toggle mobile menu
  $('.hamburger').on('click', function() {
    $(this).toggleClass('active');
    $('.nav-menu').toggleClass('active');
  });
  
  // Close mobile menu when clicking a link
  $('.nav-link').on('click', function() {
    $('.hamburger').removeClass('active');
    $('.nav-menu').removeClass('active');
  });
  
  // Back to top button
  $(window).on('scroll', function() {
    if ($(this).scrollTop() > 300) {
      $('.back-to-top').addClass('visible');
    } else {
      $('.back-to-top').removeClass('visible');
    }
  });
  
  $('.back-to-top').on('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 500);
    return false;
  });
  
  // Smooth scroll for anchor links
  $('a[href^="#"]').on('click', function(e) {
    const target = $(this.getAttribute('href'));
    if (target.length) {
      e.preventDefault();
      $('html, body').animate({
        scrollTop: target.offset().top - 80
      }, 500);
    }
  });
  
  // Login form submission
  $('#login-form').on('submit', function(e) {
    e.preventDefault();
    
    const email = $('#login-email').val();
    const password = $('#login-password').val();
    
    // In a real application, this would be an API call
    // For demo, we'll use local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Don't store password in session
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      currentUser = userWithoutPassword;
      
      showAlert('Login successful!', 'success');
      
      setTimeout(() => {
        if (user.role === 'employer') {
          window.location.href = 'employer-dashboard.html';
        } else {
          window.location.href = 'job-seeker-dashboard.html';
        }
      }, 1000);
    } else {
      showAlert('Invalid email or password!', 'error');
    }
  });
  
  // Registration form submission
  $('#register-form').on('submit', function(e) {
    e.preventDefault();
    
    const name = $('#register-name').val();
    const email = $('#register-email').val();
    const password = $('#register-password').val();
    const role = $('input[name="user-role"]:checked').val();
    
    // In a real application, this would be an API call
    // For demo, we'll use local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email is already registered
    if (users.some(u => u.email === email)) {
      showAlert('Email is already registered!', 'error');
      return;
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role,
      dateJoined: new Date().toISOString(),
      applications: [],
      savedJobs: [],
      postedJobs: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Don't store password in session
    const { password: pwd, ...userWithoutPassword } = newUser;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    currentUser = userWithoutPassword;
    
    showAlert('Registration successful!', 'success');
    
    setTimeout(() => {
      if (role === 'employer') {
        window.location.href = 'employer-dashboard.html';
      } else {
        window.location.href = 'job-seeker-dashboard.html';
      }
    }, 1000);
  });
  
  // Logout functionality
  $('.logout-btn').on('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAlert('Logged out successfully!', 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  });
  
  // Post job form submission
  $('#post-job-form').on('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser || currentUser.role !== 'employer') {
      showAlert('You must be logged in as an employer to post jobs!', 'error');
      return;
    }
    
    const jobTitle = $('#job-title').val();
    const company = $('#company-name').val();
    const location = $('#job-location').val();
    const jobType = $('#job-type').val();
    const category = $('#job-category').val();
    const salary = $('#salary-range').val();
    const description = $('#job-description').val();
    const responsibilities = $('#responsibilities').val();
    const requirements = $('#requirements').val();
    
    // Create job object
    const newJob = {
      id: Date.now().toString(),
      title: jobTitle,
      company: company,
      companyLogo: currentUser.name.substring(0, 1).toUpperCase(), // Use first letter as logo placeholder
      location: location,
      type: jobType,
      category: category,
      salary: salary,
      description: description,
      responsibilities: responsibilities.split('\n'),
      requirements: requirements.split('\n'),
      datePosted: new Date().toISOString(),
      employerId: currentUser.id,
      applications: []
    };
    
    // In a real application, this would be an API call
    // For demo, we'll use local storage
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    jobs.push(newJob);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    
    // Update current user's posted jobs
    currentUser.postedJobs.push(newJob.id);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].postedJobs.push(newJob.id);
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    showAlert('Job posted successfully!', 'success');
    
    setTimeout(() => {
      window.location.href = 'employer-dashboard.html';
    }, 1000);
  });
  
  // Job application form submission
  $('#job-application-form').on('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser || currentUser.role !== 'jobseeker') {
      showAlert('You must be logged in as a job seeker to apply!', 'error');
      return;
    }
    
    const jobId = $(this).data('job-id');
    const fullName = $('#full-name').val();
    const email = $('#email').val();
    const phone = $('#phone').val();
    const coverLetter = $('#cover-letter').val();
    const resumeFile = $('#resume').val();
    
    // Create application object
    const application = {
      id: Date.now().toString(),
      jobId: jobId,
      applicantId: currentUser.id,
      fullName: fullName,
      email: email,
      phone: phone,
      coverLetter: coverLetter,
      resumeFile: resumeFile,
      dateApplied: new Date().toISOString(),
      status: 'Pending'
    };
    
    // In a real application, this would be an API call
    // For demo, we'll use local storage
    
    // Update job applications
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    
    if (jobIndex !== -1) {
      jobs[jobIndex].applications.push(application);
      localStorage.setItem('jobs', JSON.stringify(jobs));
      
      // Update user applications
      currentUser.applications.push({
        applicationId: application.id,
        jobId: jobId,
        dateApplied: application.dateApplied,
        status: application.status
      });
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].applications.push({
          applicationId: application.id,
          jobId: jobId,
          dateApplied: application.dateApplied,
          status: application.status
        });
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      showAlert('Application submitted successfully!', 'success');
      
      setTimeout(() => {
        window.location.href = 'job-seeker-dashboard.html';
      }, 1000);
    } else {
      showAlert('Job not found!', 'error');
    }
  });
  
  // Contact form submission
  $('#contact-form').on('submit', function(e) {
    e.preventDefault();
    
    const name = $('#contact-name').val();
    const email = $('#contact-email').val();
    const subject = $('#contact-subject').val();
    const message = $('#contact-message').val();
    
    // In a real application, this would be an API call
    // For demo, we'll just show a success message
    
    showAlert('Message sent successfully!', 'success');
    this.reset();
  });
  
  // Job search functionality
  $('#search-form').on('submit', function(e) {
    e.preventDefault();
    
    const keyword = $('#search-keyword').val().toLowerCase();
    const location = $('#search-location').val().toLowerCase();
    
    // Build the query string
    let queryParams = [];
    if (keyword) queryParams.push(`keyword=${encodeURIComponent(keyword)}`);
    if (location) queryParams.push(`location=${encodeURIComponent(location)}`);
    
    // Redirect to job listings page with search parameters
    window.location.href = `job-listings.html${queryParams.length ? '?' + queryParams.join('&') : ''}`;
  });
  
  // Load and filter jobs on job listings page
  function loadJobListings() {
    if ($('#job-listings-container').length) {
      // Get jobs from local storage
      jobData = JSON.parse(localStorage.getItem('jobs') || '[]');
      
      // Get query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const keywordParam = urlParams.get('keyword');
      const locationParam = urlParams.get('location');
      
      // Set search form values from URL params if they exist
      if (keywordParam) $('#filter-keyword').val(keywordParam);
      if (locationParam) $('#filter-location').val(locationParam);
      
      // Filter jobs based on URL parameters
      filterJobs();
    }
  }
  
  // Filter jobs based on form inputs
  function filterJobs() {
    const keyword = $('#filter-keyword').val().toLowerCase();
    const location = $('#filter-location').val().toLowerCase();
    const jobType = $('#filter-job-type').val();
    const category = $('#filter-category').val();
    const sortBy = $('#sort-by').val();
    
    // Filter jobs
    filteredJobs = jobData.filter(job => {
      let matchesKeyword = true;
      let matchesLocation = true;
      let matchesType = true;
      let matchesCategory = true;
      
      if (keyword) {
        matchesKeyword = job.title.toLowerCase().includes(keyword) || 
                         job.description.toLowerCase().includes(keyword) ||
                         job.company.toLowerCase().includes(keyword);
      }
      
      if (location) {
        matchesLocation = job.location.toLowerCase().includes(location);
      }
      
      if (jobType && jobType !== 'all') {
        matchesType = job.type === jobType;
      }
      
      if (category && category !== 'all') {
        matchesCategory = job.category === category;
      }
      
      return matchesKeyword && matchesLocation && matchesType && matchesCategory;
    });
    
    // Sort jobs
    if (sortBy === 'latest') {
      filteredJobs.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
    } else if (sortBy === 'oldest') {
      filteredJobs.sort((a, b) => new Date(a.datePosted) - new Date(b.datePosted));
    }
    
    // Display jobs
    displayJobListings();
  }
  
  // Display job listings in the container
  function displayJobListings() {
    const jobListingsContainer = $('#job-listings-container');
    
    if (filteredJobs.length === 0) {
      jobListingsContainer.html('<div class="text-center py-xl"><h3>No jobs found matching your criteria</h3><p>Try adjusting your search filters</p></div>');
      return;
    }
    
    let html = '<div class="job-cards">';
    
    filteredJobs.forEach(job => {
      const datePosted = new Date(job.datePosted);
      const today = new Date();
      const diffTime = Math.abs(today - datePosted);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let daysAgo = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      
      let jobTypeClass = '';
      if (job.type === 'Full-time') jobTypeClass = 'job-tag-fulltime';
      else if (job.type === 'Part-time') jobTypeClass = 'job-tag-parttime';
      else if (job.type === 'Remote') jobTypeClass = 'job-tag-remote';
      
      html += `
        <div class="job-card">
          <div class="job-card-header">
            <div class="company-logo">${job.companyLogo}</div>
            <div>
              <div class="company-name">${job.company}</div>
              <div class="job-meta">
                <span class="job-meta-item"><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
              </div>
            </div>
          </div>
          <div class="job-card-content">
            <h3 class="job-title">${job.title}</h3>
            <div class="job-tags">
              <span class="job-tag ${jobTypeClass}">${job.type}</span>
              <span class="job-tag job-tag-fulltime">${job.category}</span>
            </div>
            <p>${job.description.substring(0, 100)}...</p>
          </div>
          <div class="job-card-footer">
            <span class="job-date"><i class="far fa-clock"></i> ${daysAgo}</span>
            <a href="job-details.html?id=${job.id}" class="btn btn-outline">View Details</a>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    jobListingsContainer.html(html);
  }
  
  // Handle job listings filter form
  $('#filter-form').on('submit', function(e) {
    e.preventDefault();
    filterJobs();
  });
  
  // Reset filters
  $('#reset-filters').on('click', function() {
    $('#filter-form')[0].reset();
    filterJobs();
  });
  
  // Sort change
  $('#sort-by').on('change', function() {
    filterJobs();
  });
  
  // Load job details on job details page
  function loadJobDetails() {
    if ($('#job-details-container').length) {
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('id');
      
      if (!jobId) {
        showAlert('Job ID not provided!', 'error');
        return;
      }
      
      // Get jobs from local storage
      const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
      const job = jobs.find(j => j.id === jobId);
      
      if (!job) {
        showAlert('Job not found!', 'error');
        return;
      }
      
      // Format date
      const datePosted = new Date(job.datePosted);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = datePosted.toLocaleDateString('en-US', options);
      
      // Check if user has already applied
      let hasApplied = false;
      if (currentUser && currentUser.role === 'jobseeker') {
        hasApplied = currentUser.applications.some(app => app.jobId === jobId);
      }
      
      // Build responsibilities and requirements HTML
      let responsibilitiesHtml = '<ul>';
      job.responsibilities.forEach(item => {
        responsibilitiesHtml += `<li>${item}</li>`;
      });
      responsibilitiesHtml += '</ul>';
      
      let requirementsHtml = '<ul>';
      job.requirements.forEach(item => {
        requirementsHtml += `<li>${item}</li>`;
      });
      requirementsHtml += '</ul>';
      
      // Update job details container
      $('#job-title').text(job.title);
      $('#job-company').text(job.company);
      $('#job-location').text(job.location);
      $('#job-type').text(job.type);
      $('#job-category').text(job.category);
      $('#job-salary').text(job.salary);
      $('#job-date').text(formattedDate);
      $('#job-description-text').text(job.description);
      $('#job-responsibilities').html(responsibilitiesHtml);
      $('#job-requirements').html(requirementsHtml);
      $('#company-logo-text').text(job.companyLogo);
      
      // Update apply button
      const applyButton = $('#apply-btn');
      if (hasApplied) {
        applyButton.text('Already Applied').addClass('btn-secondary').removeClass('btn-primary');
        applyButton.prop('disabled', true);
      } else {
        applyButton.attr('href', `job-application.html?id=${jobId}`);
      }
      
      // Set job ID for application form
      $('#job-application-form').data('job-id', jobId);
      
      // Load similar jobs (same category)
      const similarJobs = jobs.filter(j => j.category === job.category && j.id !== job.id).slice(0, 3);
      
      let similarJobsHtml = '';
      similarJobs.forEach(similarJob => {
        let jobTypeClass = '';
        if (similarJob.type === 'Full-time') jobTypeClass = 'job-tag-fulltime';
        else if (similarJob.type === 'Part-time') jobTypeClass = 'job-tag-parttime';
        else if (similarJob.type === 'Remote') jobTypeClass = 'job-tag-remote';
        
        similarJobsHtml += `
          <div class="job-card">
            <div class="job-card-header">
              <div class="company-logo">${similarJob.companyLogo}</div>
              <div>
                <div class="company-name">${similarJob.company}</div>
                <div class="job-meta">
                  <span class="job-meta-item"><i class="fas fa-map-marker-alt"></i> ${similarJob.location}</span>
                </div>
              </div>
            </div>
            <div class="job-card-content">
              <h3 class="job-title">${similarJob.title}</h3>
              <div class="job-tags">
                <span class="job-tag ${jobTypeClass}">${similarJob.type}</span>
                <span class="job-tag job-tag-fulltime">${similarJob.category}</span>
              </div>
            </div>
            <div class="job-card-footer">
              <a href="job-details.html?id=${similarJob.id}" class="btn btn-outline">View Details</a>
            </div>
          </div>
        `;
      });
      
      if (similarJobs.length === 0) {
        similarJobsHtml = '<div class="text-center py-md"><p>No similar jobs found</p></div>';
      }
      
      $('#similar-jobs-container').html(similarJobsHtml);
    }
  }
  
  // Setup job application page
  function setupJobApplication() {
    if ($('#job-application-page').length) {
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('id');
      
      if (!jobId) {
        showAlert('Job ID not provided!', 'error');
        return;
      }
      
      // Get jobs from local storage
      const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
      const job = jobs.find(j => j.id === jobId);
      
      if (!job) {
        showAlert('Job not found!', 'error');
        return;
      }
      
      // Update job info
      $('#job-title-display').text(job.title);
      $('#company-display').text(job.company);
      $('#location-display').text(job.location);
      
      // Set job ID for application form
      $('#job-application-form').data('job-id', jobId);
      
      // Pre-fill form if user is logged in
      if (currentUser && currentUser.role === 'jobseeker') {
        $('#full-name').val(currentUser.name);
        $('#email').val(currentUser.email);
      }
    }
  }
  
  // Setup employer dashboard
  function setupEmployerDashboard() {
    if ($('#employer-dashboard-page').length) {
      // Ensure user is an employer
      if (!currentUser || currentUser.role !== 'employer') {
        window.location.href = 'login.html';
        return;
      }
      
      // Get jobs from local storage
      const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
      const userJobs = jobs.filter(job => job.employerId === currentUser.id);
      
      // Update stats
      $('#total-jobs').text(userJobs.length);
      
      let totalApplications = 0;
      userJobs.forEach(job => {
        totalApplications += job.applications.length;
      });
      $('#total-applications').text(totalApplications);
      
      // Display posted jobs
      let postedJobsHtml = '';
      
      if (userJobs.length === 0) {
        postedJobsHtml = '<tr><td colspan="5" class="text-center">No jobs posted yet</td></tr>';
      } else {
        userJobs.forEach(job => {
          const datePosted = new Date(job.datePosted);
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          const formattedDate = datePosted.toLocaleDateString('en-US', options);
          
          postedJobsHtml += `
            <tr>
              <td><a href="job-details.html?id=${job.id}">${job.title}</a></td>
              <td>${formattedDate}</td>
              <td>${job.applications.length}</td>
              <td>${job.location}</td>
              <td class="table-actions">
                <a href="job-details.html?id=${job.id}" class="action-btn action-btn-view"><i class="fas fa-eye"></i></a>
                <a href="#" class="action-btn action-btn-edit edit-job" data-id="${job.id}"><i class="fas fa-edit"></i></a>
                <a href="#" class="action-btn action-btn-delete delete-job" data-id="${job.id}"><i class="fas fa-trash"></i></a>
              </td>
            </tr>
          `;
        });
      }
      
      $('#posted-jobs-table tbody').html(postedJobsHtml);
      
      // Handle recent applications
      let recentApplications = [];
      userJobs.forEach(job => {
        job.applications.forEach(app => {
          recentApplications.push({
            ...app,
            jobTitle: job.title
          });
        });
      });
      
      // Sort by date (newest first) and take the first 5
      recentApplications.sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));
      recentApplications = recentApplications.slice(0, 5);
      
      let recentApplicationsHtml = '';
      
      if (recentApplications.length === 0) {
        recentApplicationsHtml = '<tr><td colspan="5" class="text-center">No applications received yet</td></tr>';
      } else {
        recentApplications.forEach(app => {
          const dateApplied = new Date(app.dateApplied);
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          const formattedDate = dateApplied.toLocaleDateString('en-US', options);
          
          recentApplicationsHtml += `
            <tr>
              <td>${app.fullName}</td>
              <td>${app.jobTitle}</td>
              <td>${formattedDate}</td>
              <td><span class="job-tag job-tag-${app.status.toLowerCase()}">${app.status}</span></td>
              <td class="table-actions">
                <a href="#" class="action-btn action-btn-view view-application" data-id="${app.id}"><i class="fas fa-eye"></i></a>
                <a href="#" class="action-btn action-btn-edit update-status" data-id="${app.id}"><i class="fas fa-edit"></i></a>
              </td>
            </tr>
          `;
        });
      }
      
      $('#recent-applications-table tbody').html(recentApplicationsHtml);
    }
  }
  
  // Setup job seeker dashboard
  function setupJobSeekerDashboard() {
    if ($('#job-seeker-dashboard-page').length) {
      // Ensure user is a job seeker
      if (!currentUser || currentUser.role !== 'jobseeker') {
        window.location.href = 'login.html';
        return;
      }
      
      // Get jobs from local storage
      const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
      
      // Update stats
      $('#total-applications').text(currentUser.applications.length);
      $('#saved-jobs-count').text(currentUser.savedJobs.length);
      
      // Display applied jobs
      let appliedJobsHtml = '';
      
      if (currentUser.applications.length === 0) {
        appliedJobsHtml = '<tr><td colspan="5" class="text-center">No job applications yet</td></tr>';
      } else {
        currentUser.applications.forEach(app => {
          const job = jobs.find(j => j.id === app.jobId);
          if (!job) return;
          
          const dateApplied = new Date(app.dateApplied);
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          const formattedDate = dateApplied.toLocaleDateString('en-US', options);
          
          appliedJobsHtml += `
            <tr>
              <td><a href="job-details.html?id=${job.id}">${job.title}</a></td>
              <td>${job.company}</td>
              <td>${formattedDate}</td>
              <td><span class="job-tag job-tag-${app.status.toLowerCase()}">${app.status}</span></td>
              <td class="table-actions">
                <a href="job-details.html?id=${job.id}" class="action-btn action-btn-view"><i class="fas fa-eye"></i></a>
              </td>
            </tr>
          `;
        });
      }
      
      $('#applied-jobs-table tbody').html(appliedJobsHtml);
      
      // Display saved jobs
      let savedJobsHtml = '';
      
      if (currentUser.savedJobs.length === 0) {
        savedJobsHtml = '<tr><td colspan="5" class="text-center">No saved jobs yet</td></tr>';
      } else {
        currentUser.savedJobs.forEach(savedJobId => {
          const job = jobs.find(j => j.id === savedJobId);
          if (!job) return;
          
          const datePosted = new Date(job.datePosted);
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          const formattedDate = datePosted.toLocaleDateString('en-US', options);
          
          savedJobsHtml += `
            <tr>
              <td><a href="job-details.html?id=${job.id}">${job.title}</a></td>
              <td>${job.company}</td>
              <td>${job.location}</td>
              <td>${formattedDate}</td>
              <td class="table-actions">
                <a href="job-details.html?id=${job.id}" class="action-btn action-btn-view"><i class="fas fa-eye"></i></a>
                <a href="#" class="action-btn action-btn-delete remove-saved-job" data-id="${job.id}"><i class="fas fa-trash"></i></a>
              </td>
            </tr>
          `;
        });
      }
      
      $('#saved-jobs-table tbody').html(savedJobsHtml);
    }
  }
  
  // Handle save job functionality
  $(document).on('click', '.save-job-btn', function(e) {
    e.preventDefault();
    
    if (!currentUser || currentUser.role !== 'jobseeker') {
      showAlert('You must be logged in as a job seeker to save jobs!', 'error');
      return;
    }
    
    const jobId = $(this).data('id');
    
    // Check if job is already saved
    if (currentUser.savedJobs.includes(jobId)) {
      // Remove from saved jobs
      currentUser.savedJobs = currentUser.savedJobs.filter(id => id !== jobId);
      $(this).html('<i class="far fa-bookmark"></i> Save Job');
      showAlert('Job removed from saved jobs!', 'success');
    } else {
      // Add to saved jobs
      currentUser.savedJobs.push(jobId);
      $(this).html('<i class="fas fa-bookmark"></i> Saved');
      showAlert('Job saved successfully!', 'success');
    }
    
    // Update local storage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].savedJobs = currentUser.savedJobs;
      localStorage.setItem('users', JSON.stringify(users));
    }
  });
  
  // Handle remove saved job
  $(document).on('click', '.remove-saved-job', function(e) {
    e.preventDefault();
    
    const jobId = $(this).data('id');
    
    // Remove from saved jobs
    currentUser.savedJobs = currentUser.savedJobs.filter(id => id !== jobId);
    
    // Update local storage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].savedJobs = currentUser.savedJobs;
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    showAlert('Job removed from saved jobs!', 'success');
    
    // Refresh the table
    setupJobSeekerDashboard();
  });
  
  // Handle delete job
  $(document).on('click', '.delete-job', function(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to delete this job?')) {
      const jobId = $(this).data('id');
      
      // Delete job from jobs array
      const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
      
      // Remove from user's posted jobs
      currentUser.postedJobs = currentUser.postedJobs.filter(id => id !== jobId);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].postedJobs = currentUser.postedJobs;
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      showAlert('Job deleted successfully!', 'success');
      
      // Refresh the table
      setupEmployerDashboard();
    }
  });
  
  // Show alerts
  function showAlert(message, type) {
    // Remove any existing alerts
    $('.alert').remove();
    
    // Create alert element
    const alertDiv = $('<div class="alert"></div>');
    alertDiv.addClass(type === 'error' ? 'alert-error' : 'alert-success');
    alertDiv.text(message);
    
    // Add to body
    $('body').append(alertDiv);
    
    // Show with animation
    alertDiv.addClass('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
      alertDiv.removeClass('show');
      setTimeout(() => {
        alertDiv.remove();
      }, 300);
    }, 3000);
  }
  
  // Initialize form validation
  function initFormValidation() {
    // Login form validation
    $('#login-form').validate({
      rules: {
        email: {
          required: true,
          email: true
        },
        password: {
          required: true,
          minlength: 6
        }
      },
      messages: {
        email: {
          required: 'Please enter your email',
          email: 'Please enter a valid email'
        },
        password: {
          required: 'Please enter your password',
          minlength: 'Password must be at least 6 characters'
        }
      },
      errorClass: 'form-error',
      submitHandler: function(form) {
        return true;
      }
    });
    
    // Register form validation
    $('#register-form').validate({
      rules: {
        name: {
          required: true,
          minlength: 2
        },
        email: {
          required: true,
          email: true
        },
        password: {
          required: true,
          minlength: 6
        },
        'confirm-password': {
          required: true,
          equalTo: '#register-password'
        },
        'user-role': {
          required: true
        }
      },
      messages: {
        name: {
          required: 'Please enter your name',
          minlength: 'Name must be at least 2 characters'
        },
        email: {
          required: 'Please enter your email',
          email: 'Please enter a valid email'
        },
        password: {
          required: 'Please enter your password',
          minlength: 'Password must be at least 6 characters'
        },
        'confirm-password': {
          required: 'Please confirm your password',
          equalTo: 'Passwords do not match'
        },
        'user-role': {
          required: 'Please select a role'
        }
      },
      errorClass: 'form-error',
      submitHandler: function(form) {
        return true;
      }
    });
    
    // Job application form validation
    $('#job-application-form').validate({
      rules: {
        'full-name': {
          required: true,
          minlength: 2
        },
        email: {
          required: true,
          email: true
        },
        phone: {
          required: true
        },
        resume: {
          required: true
        }
      },
      messages: {
        'full-name': {
          required: 'Please enter your full name',
          minlength: 'Name must be at least 2 characters'
        },
        email: {
          required: 'Please enter your email',
          email: 'Please enter a valid email'
        },
        phone: {
          required: 'Please enter your phone number'
        },
        resume: {
          required: 'Please upload your resume'
        }
      },
      errorClass: 'form-error',
      submitHandler: function(form) {
        return true;
      }
    });
    
    // Contact form validation
    $('#contact-form').validate({
      rules: {
        name: {
          required: true,
          minlength: 2
        },
        email: {
          required: true,
          email: true
        },
        subject: {
          required: true
        },
        message: {
          required: true,
          minlength: 10
        }
      },
      messages: {
        name: {
          required: 'Please enter your name',
          minlength: 'Name must be at least 2 characters'
        },
        email: {
          required: 'Please enter your email',
          email: 'Please enter a valid email'
        },
        subject: {
          required: 'Please enter a subject'
        },
        message: {
          required: 'Please enter your message',
          minlength: 'Message must be at least 10 characters'
        }
      },
      errorClass: 'form-error',
      submitHandler: function(form) {
        return true;
      }
    });
    
    // Post job form validation
    $('#post-job-form').validate({
      rules: {
        'job-title': {
          required: true
        },
        'company-name': {
          required: true
        },
        'job-location': {
          required: true
        },
        'job-type': {
          required: true
        },
        'job-category': {
          required: true
        },
        'salary-range': {
          required: true
        },
        'job-description': {
          required: true,
          minlength: 50
        },
        responsibilities: {
          required: true
        },
        requirements: {
          required: true
        }
      },
      errorClass: 'form-error',
      submitHandler: function(form) {
        return true;
      }
    });
  }
  
  // Initialize the app
  function init() {
    // Check authentication
    checkAuth();
    
    // Handle navbar transparency
    handleNavbarTransparency();
    
    // Load appropriate content based on page
    loadJobListings();
    loadJobDetails();
    setupJobApplication();
    setupEmployerDashboard();
    setupJobSeekerDashboard();
    
    // Initialize form validation
    initFormValidation();
    
    // Add CSS for alerts
    const alertCSS = `
      .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        max-width: 300px;
        z-index: 1000;
        transform: translateX(110%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      .alert.show {
        transform: translateX(0);
      }
      
      .alert-success {
        background-color: var(--success-500);
      }
      
      .alert-error {
        background-color: var(--error-500);
      }
    `;
    
    $('<style>').text(alertCSS).appendTo('head');
    
    // Add CSS for validation
    const validationCSS = `
      .form-error {
        color: var(--error-700);
        font-size: 0.875rem;
        margin-top: 4px;
      }
      
      input.error, textarea.error, select.error {
        border-color: var(--error-500);
      }
    `;
    
    $('<style>').text(validationCSS).appendTo('head');
    
    // Init sample data if needed
    initSampleData();
  }
  
  // Initialize sample data for demo
  function initSampleData() {
    // Check if we already have jobs in local storage
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    if (jobs.length === 0) {
      // Sample jobs data
      const sampleJobs = [
        {
          id: '1',
          title: 'Senior Frontend Developer',
          company: 'TechCorp',
          companyLogo: 'T',
          location: 'New York, NY',
          type: 'Full-time',
          category: 'IT & Software',
          salary: '$90,000 - $120,000',
          description: 'We are looking for an experienced Frontend Developer to join our team. The ideal candidate will have strong skills in JavaScript, React, and modern CSS.',
          responsibilities: [
            'Develop and maintain responsive web applications',
            'Work with product managers and designers to implement new features',
            'Write clean, maintainable, and efficient code',
            'Optimize applications for maximum speed and scalability',
            'Collaborate with backend developers to integrate frontend with APIs'
          ],
          requirements: [
            '5+ years of experience in frontend development',
            'Proficiency in JavaScript, HTML, CSS, and React',
            'Experience with responsive design and mobile-first approaches',
            'Understanding of UI/UX design principles',
            'Knowledge of modern frontend build tools and workflows'
          ],
          datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          employerId: 'employer1',
          applications: []
        },
        {
          id: '2',
          title: 'Marketing Manager',
          company: 'BrandBoost',
          companyLogo: 'B',
          location: 'Chicago, IL',
          type: 'Full-time',
          category: 'Marketing',
          salary: '$70,000 - $90,000',
          description: 'BrandBoost is seeking a creative and data-driven Marketing Manager to lead our marketing efforts. The ideal candidate will have experience in digital marketing and brand strategy.',
          responsibilities: [
            'Develop and implement marketing strategies to increase brand awareness',
            'Manage social media accounts and create engaging content',
            'Analyze marketing data and make recommendations for improvement',
            'Coordinate with the sales team to ensure consistent messaging',
            'Plan and execute marketing campaigns and events'
          ],
          requirements: [
            '3+ years of experience in marketing',
            'Strong knowledge of digital marketing channels and tools',
            'Experience with social media management and content creation',
            'Excellent communication and presentation skills',
            'Analytical mindset with the ability to interpret data'
          ],
          datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          employerId: 'employer2',
          applications: []
        },
        {
          id: '3',
          title: 'UX/UI Designer',
          company: 'DesignHub',
          companyLogo: 'D',
          location: 'Remote',
          type: 'Remote',
          category: 'Design',
          salary: '$80,000 - $100,000',
          description: 'DesignHub is looking for a talented UX/UI Designer to create intuitive and engaging user experiences. The ideal candidate will have a strong portfolio demonstrating their design skills.',
          responsibilities: [
            'Create wireframes, prototypes, and high-fidelity designs',
            'Conduct user research and usability testing',
            'Collaborate with developers to ensure accurate implementation of designs',
            'Develop and maintain design systems and style guides',
            'Stay updated on design trends and best practices'
          ],
          requirements: [
            '3+ years of experience in UX/UI design',
            'Proficiency in design tools such as Figma, Sketch, or Adobe XD',
            'Strong portfolio showcasing UX/UI design projects',
            'Understanding of user-centered design principles',
            'Experience with responsive design for mobile and web'
          ],
          datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          employerId: 'employer3',
          applications: []
        },
        {
          id: '4',
          title: 'Data Analyst',
          company: 'DataInsight',
          companyLogo: 'D',
          location: 'Boston, MA',
          type: 'Full-time',
          category: 'Data Science',
          salary: '$75,000 - $95,000',
          description: 'DataInsight is seeking a detail-oriented Data Analyst to help us make data-driven decisions. The ideal candidate will have experience with data analysis and visualization tools.',
          responsibilities: [
            'Collect, clean, and analyze large datasets',
            'Create reports and visualizations to communicate insights',
            'Develop and maintain dashboards for tracking key metrics',
            'Collaborate with teams to identify data needs and requirements',
            'Implement data quality control procedures'
          ],
          requirements: [
            '2+ years of experience in data analysis',
            'Proficiency in SQL and Excel for data manipulation',
            'Experience with data visualization tools such as Tableau or Power BI',
            'Strong analytical and problem-solving skills',
            'Attention to detail and accuracy in reporting'
          ],
          datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          employerId: 'employer4',
          applications: []
        },
        {
          id: '5',
          title: 'Customer Support Specialist',
          company: 'SupportPro',
          companyLogo: 'S',
          location: 'Austin, TX',
          type: 'Part-time',
          category: 'Customer Service',
          salary: '$40,000 - $50,000',
          description: 'SupportPro is looking for a Customer Support Specialist to help our clients with technical issues. The ideal candidate will have excellent communication skills and a problem-solving mindset.',
          responsibilities: [
            'Respond to customer inquiries via phone, email, and chat',
            'Troubleshoot and resolve technical issues',
            'Document customer interactions and solutions',
            'Identify common issues and suggest improvements',
            'Provide feedback to product development teams'
          ],
          requirements: [
            '1+ years of experience in customer support or related field',
            'Excellent communication and interpersonal skills',
            'Ability to explain technical concepts in simple terms',
            'Problem-solving mindset and patience',
            'Basic understanding of software applications'
          ],
          datePosted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          employerId: 'employer5',
          applications: []
        },
        {
          id: '6',
          title: 'Backend Developer',
          company: 'CodeNexus',
          companyLogo: 'C',
          location: 'San Francisco, CA',
          type: 'Full-time',
          category: 'IT & Software',
          salary: '$100,000 - $130,000',
          description: 'CodeNexus is seeking a skilled Backend Developer to help us build robust and scalable APIs. The ideal candidate will have experience with Node.js and database design.',
          responsibilities: [
            'Design and implement RESTful APIs',
            'Optimize database queries for performance',
            'Implement security and data protection measures',
            'Write unit and integration tests',
            'Collaborate with frontend developers to integrate APIs'
          ],
          requirements: [
            '4+ years of experience in backend development',
            'Proficiency in Node.js, Express, and database technologies',
            'Experience with API design and implementation',
            'Knowledge of security best practices',
            'Familiarity with cloud platforms such as AWS or Azure'
          ],
          datePosted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          employerId: 'employer6',
          applications: []
        }
      ];
      
      // Save to local storage
      localStorage.setItem('jobs', JSON.stringify(sampleJobs));
      
      // Create sample employer users
      const sampleUsers = [
        {
          id: 'employer1',
          name: 'John Smith',
          email: 'john@techcorp.com',
          password: 'password123',
          role: 'employer',
          dateJoined: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          postedJobs: ['1'],
          applications: []
        },
        {
          id: 'employer2',
          name: 'Sarah Johnson',
          email: 'sarah@brandboost.com',
          password: 'password123',
          role: 'employer',
          dateJoined: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          postedJobs: ['2'],
          applications: []
        },
        {
          id: 'employer3',
          name: 'Michael Brown',
          email: 'michael@designhub.com',
          password: 'password123',
          role: 'employer',
          dateJoined: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          postedJobs: ['3'],
          applications: []
        },
        {
          id: 'employer4',
          name: 'Emily Davis',
          email: 'emily@datainsight.com',
          password: 'password123',
          role: 'employer',
          dateJoined: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          postedJobs: ['4'],
          applications: []
        },
        {
          id: 'employer5',
          name: 'David Wilson',
          email: 'david@supportpro.com',
          password: 'password123',
          role: 'employer',
          dateJoined: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          postedJobs: ['5'],
          applications: []
        },
        {
          id: 'employer6',
          name: 'Jessica Miller',
          email: 'jessica@codenexus.com',
          password: 'password123',
          role: 'employer',
          dateJoined: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          postedJobs: ['6'],
          applications: []
        },
        {
          id: 'jobseeker1',
          name: 'Thomas Anderson',
          email: 'thomas@example.com',
          password: 'password123',
          role: 'jobseeker',
          dateJoined: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          applications: [],
          savedJobs: ['1', '3', '6']
        }
      ];
      
      // Check if users already exist
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (existingUsers.length === 0) {
        localStorage.setItem('users', JSON.stringify(sampleUsers));
      }
    }
  }
  
  // Run initialization
  init();
});