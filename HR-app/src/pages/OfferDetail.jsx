import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { offers, departmentColors } from '../data/offers';

const yearOptions = ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Masters', 'Other'];

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email address.';
  if (!form.phone.trim()) errors.phone = 'Phone number is required.';
  if (!form.university.trim()) errors.university = 'University / School is required.';
  if (!form.yearOfStudy) errors.yearOfStudy = 'Please select your year of study.';
  if (!form.coverLetter.trim()) errors.coverLetter = 'Cover letter is required.';
  else if (form.coverLetter.trim().length < 100) errors.coverLetter = `Cover letter must be at least 100 characters (${form.coverLetter.trim().length}/100).`;
  if (!form.cv) errors.cv = 'Please upload your CV (PDF).';
  else if (form.cv.type !== 'application/pdf') errors.cv = 'Only PDF files are accepted.';
  return errors;
}

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const offer = offers.find((o) => o.id === id);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    yearOfStudy: '',
    coverLetter: '',
    cv: null,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!offer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Offer Not Found</h2>
        <p className="text-gray-500 mb-6">This internship offer doesn't exist or has been removed.</p>
        <Link to="/offers" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
          Back to Offers
        </Link>
      </div>
    );
  }

  const badgeClass = departmentColors[offer.department] || 'bg-gray-100 text-gray-700';

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const application = {
      id: Date.now().toString(),
      offerId: offer.id,
      offerTitle: offer.title,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      university: form.university,
      yearOfStudy: form.yearOfStudy,
      coverLetter: form.coverLetter,
      cvName: form.cv.name,
      appliedAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('applications') || '[]');
    localStorage.setItem('applications', JSON.stringify([...existing, application]));
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate('/offers')}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 group transition-colors"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Offers
        </button>

        {/* Offer Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="p-8">
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>{offer.department}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{offer.title}</h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <InfoPill icon="clock" label="Duration" value={offer.duration} />
              <InfoPill icon="location" label="Location" value={offer.location} />
              <InfoPill icon="calendar" label="Start Date" value={offer.startDate} />
              <InfoPill icon="department" label="Department" value={offer.department} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">About the Role</h2>
            <p className="text-gray-600 leading-relaxed mb-6">{offer.description}</p>

            <h2 className="text-lg font-bold text-gray-900 mb-3">Requirements</h2>
            <ul className="space-y-2">
              {offer.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Application Form */}
        {submitted ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-10 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Your application has been submitted successfully. We will contact you soon.
            </p>
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse More Offers
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Apply for this Position</h2>
              <p className="text-gray-500 text-sm mt-1">Fill in all required fields below. Fields marked with * are mandatory.</p>
            </div>
            <form onSubmit={handleSubmit} noValidate className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField label="Full Name *" error={errors.fullName}>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={inputClass(errors.fullName)}
                  />
                </FormField>
                <FormField label="Email Address *" error={errors.email}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={inputClass(errors.email)}
                  />
                </FormField>
                <FormField label="Phone Number *" error={errors.phone}>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+216 XX XXX XXX"
                    className={inputClass(errors.phone)}
                  />
                </FormField>
                <FormField label="University / School *" error={errors.university}>
                  <input
                    type="text"
                    name="university"
                    value={form.university}
                    onChange={handleChange}
                    placeholder="University of Tunis"
                    className={inputClass(errors.university)}
                  />
                </FormField>
              </div>

              <FormField label="Year of Study *" error={errors.yearOfStudy}>
                <select
                  name="yearOfStudy"
                  value={form.yearOfStudy}
                  onChange={handleChange}
                  className={inputClass(errors.yearOfStudy)}
                >
                  <option value="">Select your year of study</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Cover Letter *" error={errors.coverLetter}>
                <textarea
                  name="coverLetter"
                  value={form.coverLetter}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Tell us about yourself, your motivation, and why you're a great fit for this role (minimum 100 characters)..."
                  className={`${inputClass(errors.coverLetter)} resize-none`}
                />
                <div className="text-right mt-1">
                  <span className={`text-xs ${form.coverLetter.length < 100 ? 'text-gray-400' : 'text-green-600'}`}>
                    {form.coverLetter.length} / 100 characters
                  </span>
                </div>
              </FormField>

              <FormField label="CV Upload * (PDF only)" error={errors.cv}>
                <label className={`block w-full cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${errors.cv ? 'border-red-300 bg-red-50' : form.cv ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                  <input
                    type="file"
                    name="cv"
                    accept="application/pdf"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <svg className={`w-8 h-8 mx-auto mb-2 ${form.cv ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">
                    {form.cv ? (
                      <span className="text-green-700">{form.cv.name}</span>
                    ) : (
                      <>Click to upload or drag and drop<br /><span className="text-xs text-gray-400">PDF only</span></>
                    )}
                  </p>
                </label>
              </FormField>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors duration-200 text-base shadow-sm hover:shadow-md"
              >
                Submit Application
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }) {
  const icons = {
    clock: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    location: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    calendar: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    department: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
  };

  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(error) {
  return `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
    error
      ? 'border-red-300 focus:ring-red-400 bg-red-50'
      : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'
  }`;
}
