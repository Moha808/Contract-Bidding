import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from '../components/Modal';

const SAMPLE_PROJECTS = [
  {
    title: 'Construction of a Fence Around the School Farm',
    description: 'Provision of materials and labour for the construction of a perimeter fence (block wall with iron gate) enclosing the college farm to prevent livestock intrusion.',
    budget: 200000000,
    category: 'Civil/Building',
    deadline: 90,
  },
  {
    title: 'Renovation of the Main Administrative Block',
    description: 'Comprehensive renovation works including re-roofing, painting, installation of new doors and windows, and general refurbishment of the main administrative building.',
    budget: 85000000,
    category: 'Civil/Building',
    deadline: 60,
  },
  {
    title: 'Electrification of Student Hostel Block A & B',
    description: 'Complete rewiring and installation of new electrical fittings, sockets, circuit breakers, and outdoor security lights for student hostels Block A and Block B.',
    budget: 45000000,
    category: 'Electrical',
    deadline: 45,
  },
  {
    title: 'Supply and Installation of Laboratory Equipment (Science Block)',
    description: 'Procurement and installation of modern laboratory apparatus, benches, fume hoods, and safety equipment for the Biology, Chemistry, and Physics laboratories.',
    budget: 120000000,
    category: 'Supplies/IT',
    deadline: 30,
  },
  {
    title: 'Borehole Drilling and Water Reticulation Project',
    description: 'Drilling of a mechanised borehole, installation of overhead tanks, and laying of distribution pipes to supply potable water to hostels, classrooms, and staff quarters.',
    budget: 65000000,
    category: 'Plumbing',
    deadline: 75,
  },
  {
    title: 'Construction of 2 Nos. Additional Classroom Blocks',
    description: 'Construction of two additional 6-classroom blocks with modern furniture, ceiling fans, proper ventilation, and access ramps for persons with disabilities.',
    budget: 350000000,
    category: 'Civil/Building',
    deadline: 180,
  },
];

const NewProject = () => {
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  const showModal = (type, title, message, onConfirm = null) => setModal({ isOpen: true, type, title, message, onConfirm });
  const closeModal = () => setModal(m => ({ ...m, isOpen: false }));

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    deadline: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSeedProjects = async () => {
    showModal('confirm', 
      'Seed Sample Projects', 
      `This will add ${SAMPLE_PROJECTS.length} sample projects to the database. Continue?`, 
      async () => {
        setSeeding(true);
        try {
          const batch = writeBatch(db);
          SAMPLE_PROJECTS.forEach(project => {
            const ref = doc(collection(db, 'projects'));
            batch.set(ref, { ...project, createdAt: new Date().toISOString() });
          });
          await batch.commit();
          showModal('success', 'Projects Added', `Successfully added ${SAMPLE_PROJECTS.length} sample projects.`, () => navigate('/dashboard'));
        } catch (error) {
          console.error("Error seeding projects:", error);
          showModal('error', 'Error', 'Failed to add sample projects. Please try again.');
        } finally {
          setSeeding(false);
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'projects'), {
        ...formData,
        budget: Number(formData.budget),
        deadline: Number(formData.deadline),
        createdAt: new Date().toISOString()
      });
      showModal('success', 'Project Created', 'The project has been published successfully.', () => navigate('/dashboard'));
    } catch (error) {
      console.error("Error adding project: ", error);
      showModal('error', 'Creation Failed', 'Failed to create the project.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500 space-y-6">
      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => {
          closeModal();
          if (modal.type === 'success' && !modal.onConfirm) {
            // handle success close if onConfirm isn't passed (it is passed in showModal above, but just in case)
          } else if (modal.onConfirm && modal.type !== 'confirm') {
            modal.onConfirm();
          }
        }} 
        type={modal.type} 
        title={modal.title} 
        message={modal.message} 
        onConfirm={modal.onConfirm} 
      />

      {/* Quick Seed Card */}
      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-indigo-800 dark:text-indigo-300 text-sm">Quick-Add Sample Projects</h3>
          <p className="text-indigo-600 dark:text-indigo-400 text-xs mt-1">
            Populate the database with {SAMPLE_PROJECTS.length} realistic FCAH&PT Vom contract projects instantly.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSeedProjects}
          disabled={seeding}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold py-2 px-5 rounded-xl transition-colors"
        >
          {seeding ? 'Adding...' : `Add ${SAMPLE_PROJECTS.length} Sample Projects`}
        </button>
      </div>

      {/* Manual Create Form */}
      <div className="glass-panel p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create Project</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manually publish a new contract bidding opportunity</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input 
              type="text" 
              name="title"
              required
              placeholder="e.g. Construction of 2 Nos Class Rooms"
              className="input-field"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea 
              name="description"
              required
              rows="4"
              placeholder="Provide detailed requirements for this project..."
              className="input-field resize-none"
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Budget (₦)</label>
              <input 
                type="number" 
                name="budget"
                required
                min="0"
                placeholder="9000000"
                className="input-field"
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <input 
                type="text" 
                name="category"
                required
                list="cat-list"
                placeholder="e.g. Civil/Building"
                className="input-field"
                onChange={handleChange}
              />
              <datalist id="cat-list">
                <option value="Civil/Building" />
                <option value="Electrical" />
                <option value="Plumbing" />
                <option value="Supplies/IT" />
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline (days)</label>
            <input 
              type="number" 
              name="deadline"
              required
              min="1"
              placeholder="35"
              className="input-field"
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
            >
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProject;


