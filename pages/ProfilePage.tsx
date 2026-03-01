import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Clock, Wallet, Bell, Gift, Phone, Settings, 
  HelpCircle, Info, LogOut, ChevronRight, User as UserIcon, CheckCircle2,
  Shield, Key, Banknote, CreditCard, Smartphone, Check, MapPin, Calendar, Car,
  Plus, Trash2, Package, X, UserPlus, Users, Camera
} from 'lucide-react';
import { UserRole, UserProfile, EmergencyContact } from '../types';
import { MOCK_HISTORY } from '../constants';
import { Button } from '../components/Button';

interface ProfilePageProps {
  onBack: () => void;
  onNavigateToPersonalInfo: () => void;
  onSwitchRole: (role: UserRole) => void;
  currentRole: UserRole;
  onLogout: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

type ProfileView = 'MAIN' | 'SETTINGS' | 'SETTINGS_CURRENCY' | 'SETTINGS_PAYMENT' | 'SETTINGS_WALLET' | 'RIDE_HISTORY' | 'SETTINGS_ADD_CARD' | 'LOST_ITEMS' | 'EMERGENCY_CONTACTS';

type CardBrand = 'visa' | 'mastercard' | 'generic';

interface SavedCard {
  id: string;
  number: string;
  name: string;
  expiry: string;
  brand: CardBrand;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  onBack, 
  onNavigateToPersonalInfo, 
  onSwitchRole, 
  currentRole,
  onLogout,
  userProfile,
  onUpdateProfile
}) => {
  const [currentView, setCurrentView] = useState<ProfileView>('MAIN');
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { id: '1', number: '4242424242424242', name: 'DEMO USER', expiry: '12/28', brand: 'visa' }
  ]);
  const [newCard, setNewCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phoneNumber: '', relation: '' });

  const [lostItemTripId, setLostItemTripId] = useState<string | null>(null);
  const [lostItemDesc, setLostItemDesc] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const menuItems = [
    { icon: Clock, label: 'Ride History', action: () => setCurrentView('RIDE_HISTORY') },
    { icon: Package, label: 'Lost Items', action: () => setCurrentView('LOST_ITEMS') },
    { icon: Wallet, label: 'Wallet', action: () => {} },
    { icon: Settings, label: 'Account Settings', action: () => setCurrentView('SETTINGS') },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: Gift, label: 'Invite Friends', action: () => {} },
    { icon: Phone, label: 'Emergency Contacts', action: () => setCurrentView('EMERGENCY_CONTACTS') },
    { icon: HelpCircle, label: 'Help / Support', action: () => {} },
    { icon: Info, label: 'About Us', action: () => {} },
  ];

  const handleDriverToggle = () => {
    // If switching TO driver, and not verified, this will trigger the KYC flow in App.tsx
    if (currentRole === 'RIDER') {
      onSwitchRole('DRIVER');
    } else {
      onSwitchRole('RIDER');
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInternalBack = () => {
    switch (currentView) {
      case 'SETTINGS_ADD_CARD': setCurrentView('SETTINGS_PAYMENT'); break;
      case 'SETTINGS_WALLET': setCurrentView('SETTINGS_PAYMENT'); break;
      case 'SETTINGS_PAYMENT': setCurrentView('SETTINGS'); break;
      case 'SETTINGS_CURRENCY': setCurrentView('SETTINGS'); break;
      case 'SETTINGS': setCurrentView('MAIN'); break;
      case 'RIDE_HISTORY': setCurrentView('MAIN'); break;
      case 'LOST_ITEMS': setCurrentView('MAIN'); break;
      case 'EMERGENCY_CONTACTS': setCurrentView('MAIN'); break;
      default: onBack();
    }
  };

  const getCardBrand = (number: string): CardBrand => {
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    return 'generic';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleSaveCard = () => {
    if (newCard.number.length < 13 || !newCard.name || !newCard.expiry || !newCard.cvv) return;
    
    const brand = getCardBrand(newCard.number);
    const last4 = newCard.number.slice(-4);
    const card: SavedCard = {
      id: Date.now().toString(),
      number: newCard.number,
      name: newCard.name,
      expiry: newCard.expiry,
      brand
    };

    setSavedCards([...savedCards, card]);
    onUpdateProfile({ 
        preferredPaymentType: 'CARD', 
        selectedCardLast4: last4 
    });
    setNewCard({ number: '', name: '', expiry: '', cvv: '' });
    setCurrentView('SETTINGS_PAYMENT');
  };

  const handleAddEmergencyContact = () => {
    if (userProfile.emergencyContacts.length >= 5) return;
    if (!contactForm.name || !contactForm.phoneNumber) return;

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      ...contactForm
    };

    onUpdateProfile({
      emergencyContacts: [...userProfile.emergencyContacts, newContact]
    });
    setContactForm({ name: '', phoneNumber: '', relation: '' });
    setShowAddContact(false);
  };

  const handleRemoveEmergencyContact = (id: string) => {
    onUpdateProfile({
      emergencyContacts: userProfile.emergencyContacts.filter(c => c.id !== id)
    });
  };

  if (currentView === 'EMERGENCY_CONTACTS') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center shadow-sm z-20 sticky top-0">
          <button onClick={handleInternalBack} className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-2 text-lg font-bold text-slate-900 dark:text-white flex-1">Emergency Contacts</h1>
          <div className="text-xs font-bold text-slate-400 uppercase">{userProfile.emergencyContacts.length}/5</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-wobio-50 dark:bg-wobio-900/20 p-5 rounded-2xl border border-wobio-100 dark:border-wobio-800 mb-2">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-wobio-500 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-wobio-900 dark:text-wobio-100 text-sm">Stay safe with WOBIO</h3>
                <p className="text-xs text-wobio-700 dark:text-wobio-300 mt-1 leading-relaxed">
                  We'll contact these people and share your live location if you use the SOS button during a trip.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {userProfile.emergencyContacts.length > 0 ? (
              userProfile.emergencyContacts.map((contact) => (
                <div key={contact.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold uppercase">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{contact.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{contact.relation} • {contact.phoneNumber}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveEmergencyContact(contact.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">No contacts yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add up to 5 trusted people.</p>
              </div>
            )}
          </div>

          {userProfile.emergencyContacts.length < 5 && (
            <button 
              onClick={() => setShowAddContact(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-wobio-500 hover:border-wobio-500 hover:bg-wobio-50/50 dark:hover:bg-wobio-900/10 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <UserPlus className="w-5 h-5" />
              Add Contact
            </button>
          )}
        </div>

        {showAddContact && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-[32px] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-20 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Contact</h2>
                <button onClick={() => setShowAddContact(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wider">Full Name</label>
                  <input 
                    type="text"
                    value={contactForm.name}
                    onChange={e => setContactForm({...contactForm, name: e.target.value})}
                    placeholder="E.g. John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-wobio-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wider">Phone Number</label>
                  <input 
                    type="tel"
                    value={contactForm.phoneNumber}
                    onChange={e => setContactForm({...contactForm, phoneNumber: e.target.value})}
                    placeholder="+263 77..."
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-wobio-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wider">Relation</label>
                  <input 
                    type="text"
                    value={contactForm.relation}
                    onChange={e => setContactForm({...contactForm, relation: e.target.value})}
                    placeholder="E.g. Brother, Friend"
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-wobio-500 font-medium"
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button 
                  fullWidth 
                  size="lg"
                  disabled={!contactForm.name || !contactForm.phoneNumber}
                  onClick={handleAddEmergencyContact}
                  className="shadow-lg shadow-wobio-500/20"
                >
                  Save Contact
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'RIDE_HISTORY') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center shadow-sm z-20 sticky top-0">
          <button onClick={handleInternalBack} className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-2 text-lg font-bold text-slate-900 dark:text-white flex-1">Ride History</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {MOCK_HISTORY.map((trip, index) => (
            <div 
              key={trip.id} 
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4 border-b border-slate-50 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>{trip.date}</span>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                  ${trip.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600'}`}>
                  {trip.status}
                </div>
              </div>
              <div className="flex items-start gap-4 mb-4">
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                   <MapPin className="w-5 h-5 text-wobio-600 dark:text-wobio-400" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{trip.dest}</h3>
                   <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Wobio Standard • 4.2 km</p>
                 </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                 <div className="font-bold text-lg text-slate-900 dark:text-white">
                   ${trip.price.toFixed(2)}
                 </div>
                 <button className="flex items-center gap-2 text-sm font-semibold text-wobio-600 dark:text-wobio-400 hover:bg-wobio-50 dark:hover:bg-wobio-900/20 px-3 py-1.5 rounded-lg transition-colors">
                    <Car className="w-4 h-4" />
                    Rebook
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === 'LOST_ITEMS') {
    if (reportSuccess) {
        return (
            <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 relative">
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                        <div className="absolute inset-0 border-4 border-green-200 dark:border-green-800 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Report Received</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">
                        We have notified our support team and the driver. We will contact you at <strong>{userProfile.phoneNumber}</strong> with any updates.
                    </p>
                    <button 
                        onClick={() => { setReportSuccess(false); setLostItemTripId(null); setLostItemDesc(''); setCurrentView('MAIN'); }}
                        className="w-full max-w-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                        Return to Profile
                    </button>
                </div>
            </div>
        )
    }

    return (
      <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center shadow-sm z-20 sticky top-0">
          <button onClick={() => setCurrentView('MAIN')} className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-2 text-lg font-bold text-slate-900 dark:text-white flex-1">Report Lost Item</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
             <div className="mb-6">
                 <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 ml-1">1. Select the ride</h2>
                 <div className="space-y-3">
                     {MOCK_HISTORY.slice(0, 3).map(trip => (
                         <div 
                            key={trip.id}
                            onClick={() => setLostItemTripId(trip.id)}
                            className={`bg-white dark:bg-slate-900 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between
                                ${lostItemTripId === trip.id 
                                    ? 'border-wobio-500 bg-wobio-50 dark:bg-wobio-900/10 shadow-md' 
                                    : 'border-transparent shadow-sm hover:border-slate-200 dark:hover:border-slate-700'}`}
                         >
                             <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lostItemTripId === trip.id ? 'bg-wobio-200 dark:bg-wobio-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                     <Car className={`w-5 h-5 ${lostItemTripId === trip.id ? 'text-wobio-700 dark:text-wobio-200' : 'text-slate-500'}`} />
                                 </div>
                                 <div>
                                     <div className="font-bold text-slate-900 dark:text-white">{trip.dest}</div>
                                     <div className="text-xs text-slate-500 dark:text-slate-400">{trip.date} • ${trip.price.toFixed(2)}</div>
                                 </div>
                             </div>
                             {lostItemTripId === trip.id && <Check className="w-5 h-5 text-wobio-600" />}
                         </div>
                     ))}
                 </div>
             </div>
             <div className="mb-6">
                 <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 ml-1">2. Describe the item</h2>
                 <textarea 
                    value={lostItemDesc}
                    onChange={(e) => setLostItemDesc(e.target.value)}
                    placeholder="E.g. Blue leather wallet, black iPhone 13 case..."
                    className="w-full h-32 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-wobio-500 resize-none font-medium"
                 />
             </div>
             <button disabled={!lostItemTripId || !lostItemDesc.trim()} onClick={() => setReportSuccess(true)} className="w-full bg-wobio-500 hover:bg-wobio-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-wobio-500/20 disabled:shadow-none transition-all">Submit Report</button>
        </div>
      </div>
    );
  }

  if (currentView === 'SETTINGS') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center shadow-sm z-20 sticky top-0">
          <button onClick={handleInternalBack} className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-2 text-lg font-bold text-slate-900 dark:text-white flex-1">Account Settings</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400"><Shield className="w-5 h-5" /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Enable Face ID / Touch ID</span>
              </div>
              <button onClick={() => setFaceIdEnabled(!faceIdEnabled)} className={`w-12 h-7 rounded-full transition-colors relative ${faceIdEnabled ? 'bg-wobio-500' : 'bg-slate-300 dark:bg-slate-600'}`}><div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${faceIdEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div></button>
            </div>
            <button onClick={() => setCurrentView('SETTINGS_CURRENCY')} className="w-full flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-wobio-50 dark:group-hover:bg-wobio-900/20 group-hover:text-wobio-600 transition-colors"><Banknote className="w-5 h-5" /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Change Currency</span>
              </div>
              <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">{currency}</span><ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-wobio-500 transition-colors" /></div>
            </button>
            <button onClick={() => setCurrentView('SETTINGS_PAYMENT')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-wobio-50 dark:group-hover:bg-wobio-900/20 group-hover:text-wobio-600 transition-colors"><CreditCard className="w-5 h-5" /></div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Payment Method</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-sm font-medium text-slate-400">
                    {userProfile.preferredPaymentType === 'CASH' ? 'Cash' : userProfile.preferredPaymentType === 'WALLET' ? userProfile.selectedWalletName : `Card • ${userProfile.selectedCardLast4}`}
                 </span>
                 <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-wobio-500 transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'SETTINGS_CURRENCY') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center shadow-sm z-20 sticky top-0">
          <button onClick={handleInternalBack} className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="ml-2 text-lg font-bold text-slate-900 dark:text-white flex-1">Change Currency</h1>
        </div>
        <div className="p-4"><div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">{['USD', 'ZiG'].map((curr) => (<button key={curr} onClick={() => { setCurrency(curr); handleInternalBack(); }} className="w-full flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800 last:border-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><div className="flex items-center gap-3"><span className="text-2xl">{curr === 'USD' ? '🇺🇸' : '🇿🇼'}</span><div className="text-left"><div className="font-bold text-slate-900 dark:text-white">{curr}</div><div className="text-xs text-slate-500">{curr === 'USD' ? 'United States Dollar' : 'Zimbabwe Gold'}</div></div></div>{currency === curr && <Check className="w-5 h-5 text-wobio-500" />}</button>))}</div></div>
      </div>
    );
  }

  if (currentView === 'SETTINGS_ADD_CARD') {
      const brand = getCardBrand(newCard.number);
      const isVisa = brand === 'visa';
      const isMaster = brand === 'mastercard';
      return (
        <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
            <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center shadow-sm z-20 sticky top-0">
                <button onClick={() => setCurrentView('SETTINGS_PAYMENT')} className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="ml-2 text-lg font-bold text-slate-900 dark:text-white flex-1">Add Card</h1>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
                <div className={`w-full aspect-[1.586] rounded-2xl p-6 relative overflow-hidden shadow-2xl mb-8 transition-all duration-500 transform hover:scale-[1.02] ${isVisa ? 'bg-gradient-to-br from-[#1A1F71] to-[#005696]' : isMaster ? 'bg-gradient-to-br from-[#EB001B] to-[#F79E1B]' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}><div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div><div className="w-12 h-9 rounded-lg bg-gradient-to-br from-yellow-200 to-yellow-500 mb-6 relative overflow-hidden border border-yellow-600/30"></div><div className="text-white font-mono text-xl sm:text-2xl tracking-widest mb-6 drop-shadow-md">{newCard.number || '•••• •••• •••• ••••'}</div><div className="flex justify-between items-end"><div><div className="text-[10px] text-white/70 uppercase font-bold tracking-wider mb-1">Card Holder</div><div className="text-white font-medium uppercase tracking-wide truncate max-w-[150px] sm:max-w-[200px]">{newCard.name || 'YOUR NAME'}</div></div><div><div className="text-[10px] text-white/70 uppercase font-bold tracking-wider mb-1">Expires</div><div className="text-white font-medium">{newCard.expiry || 'MM/YY'}</div></div></div></div>
                <div className="space-y-4"><div className="space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Card Number</label><input type="text" maxLength={19} value={newCard.number} onChange={(e) => { const val = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, ''); setNewCard({...newCard, number: formatCardNumber(val)}) }} placeholder="0000 0000 0000 0000" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-mono font-medium focus:outline-none focus:border-wobio-500 transition-colors" /></div><div className="space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Card Holder Name</label><input type="text" value={newCard.name} onChange={(e) => setNewCard({...newCard, name: e.target.value.toUpperCase()})} placeholder="JOHN DOE" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-wobio-500 transition-colors uppercase" /></div><div className="flex gap-4"><div className="flex-1 space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Expiry Date</label><input type="text" maxLength={5} value={newCard.expiry} onChange={(e) => { let val = e.target.value.replace(/[^0-9]/g, ''); if(val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2); setNewCard({...newCard, expiry: val}) }} placeholder="MM/YY" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-wobio-500 transition-colors text-center" /></div><div className="flex-1 space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">CVV</label><input type="password" maxLength={3} value={newCard.cvv} onChange={(e) => setNewCard({...newCard, cvv: e.target.value.replace(/[^0-9]/g, '')})} placeholder="123" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-wobio-500 transition-colors text-center" /></div></div></div>
                <div className="mt-8"><button onClick={handleSaveCard} disabled={newCard.number.length < 16 || !newCard.name || !newCard.expiry || !newCard.cvv} className="w-full bg-wobio-500 hover:bg-wobio-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-wobio-500/20 disabled:opacity-50 transition-all">Save Card</button></div>
            </div>
        </div>
      );
  }

  if (currentView === 'SETTINGS_PAYMENT') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center shadow-sm z-20 sticky top-0">
          <button onClick={handleInternalBack} className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="ml-2 text-lg font-bold text-slate-900 dark:text-white flex-1">Payment Methods</h1>
        </div>
        <div className="p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
            <button onClick={() => onUpdateProfile({ preferredPaymentType: 'CASH' })} className="w-full flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${userProfile.preferredPaymentType === 'CASH' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}><Banknote className="w-5 h-5" /></div><div className="text-left"><div className="font-semibold text-slate-900 dark:text-white">Cash</div></div></div>{userProfile.preferredPaymentType === 'CASH' && <Check className="w-5 h-5 text-wobio-500" />}</button>
            <button onClick={() => setCurrentView('SETTINGS_WALLET')} className="w-full flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${userProfile.preferredPaymentType === 'WALLET' ? 'bg-wobio-100 text-wobio-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}><Smartphone className="w-5 h-5" /></div><div className="text-left"><div className="font-semibold text-slate-900 dark:text-white">Wallet</div><div className="text-xs text-wobio-600 dark:text-wobio-400 font-medium">{userProfile.selectedWalletName || 'Select Provider'}</div></div></div>{userProfile.preferredPaymentType === 'WALLET' ? <Check className="w-5 h-5 text-wobio-500" /> : <ChevronRight className="w-5 h-5 text-slate-300" />}</button>
          </div>
          <div className="mb-2 px-1 flex items-center justify-between"><span className="text-xs font-bold text-slate-500 uppercase">Saved Cards</span><button onClick={() => setCurrentView('SETTINGS_ADD_CARD')} className="text-xs font-bold text-wobio-600 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add New</button></div>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
             {savedCards.map(card => (
                <button key={card.id} onClick={() => onUpdateProfile({ preferredPaymentType: 'CARD', selectedCardLast4: card.number.slice(-4) })} className="w-full flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800 last:border-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"><div className="flex items-center gap-4"><div className="w-10 h-7 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center relative overflow-hidden">{card.brand === 'visa' && <span className="text-[10px] font-black italic text-blue-800">VISA</span>}<CreditCard className="w-4 h-4 text-slate-500" /></div><div className="text-left"><div className="font-semibold text-slate-900 dark:text-white font-mono text-sm">•••• {card.number.slice(-4)}</div><div className="text-[10px] text-slate-400 font-medium">Expires {card.expiry}</div></div></div>{userProfile.preferredPaymentType === 'CARD' && userProfile.selectedCardLast4 === card.number.slice(-4) && <Check className="w-5 h-5 text-wobio-500" />}</button>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'SETTINGS_WALLET') {
    const wallets = [ { id: 'ecocash', name: 'Ecocash' }, { id: 'onemoney', name: 'OneMoney' }, { id: 'innbucks', name: 'InnBucks' }, { id: 'telecash', name: 'Telecash' }, { id: 'omari', name: 'Omari' } ];
    return (
      <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center shadow-sm z-20 sticky top-0"><button onClick={handleInternalBack} className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button><h1 className="ml-2 text-lg font-bold text-slate-900 dark:text-white flex-1">Select Wallet</h1></div>
        <div className="p-4"><div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">{wallets.map((wallet) => (<button key={wallet.id} onClick={() => { onUpdateProfile({ preferredPaymentType: 'WALLET', selectedWalletName: wallet.name }); setCurrentView('SETTINGS_PAYMENT'); }} className="w-full flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800 last:border-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center"><Wallet className="w-6 h-6 text-slate-400" /></div><div className="font-bold text-slate-900 dark:text-white text-base">{wallet.name}</div></div>{userProfile.selectedWalletName === wallet.name ? (<div className="w-6 h-6 bg-wobio-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>) : (<ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-wobio-500 transition-colors" />)}</button>))}</div></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-slate-950 flex flex-col h-full w-full transition-colors duration-300">
      <div className="bg-wobio-500 rounded-b-[32px] pt-8 pb-10 px-6 shadow-xl z-10 relative">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="absolute top-8 left-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button>
          <div 
            onClick={() => profileInputRef.current?.click()}
            className="w-20 h-20 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center overflow-hidden cursor-pointer mt-8 relative group"
          >
            {userProfile.profileImage ? <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-white" />}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input 
              type="file" 
              ref={profileInputRef} 
              onChange={handleProfileImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <div className="mt-8 flex-1" onClick={onNavigateToPersonalInfo}><h1 className="text-2xl font-bold text-white tracking-wide truncate">{userProfile.firstName} {userProfile.lastName}</h1><div className="flex items-center gap-2 mt-1"><span className="text-wobio-100 font-medium text-sm">{userProfile.phoneNumber}</span>{userProfile.idVerified && (<div className="bg-green-400/20 px-2 py-0.5 rounded flex items-center gap-1 border border-green-400/30"><CheckCircle2 className="w-3 h-3 text-green-300" /><span className="text-[10px] font-bold text-green-100 uppercase">Verified</span></div>)}</div></div>
          <button onClick={onNavigateToPersonalInfo} className="mt-8 p-2 text-white/60"><ChevronRight className="w-6 h-6" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto -mt-6 pt-8 pb-24 px-4"><div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">{menuItems.map((item, index) => (<button key={index} onClick={item.action} className="w-full flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800 last:border-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-wobio-600 group-hover:bg-wobio-50 dark:group-hover:bg-wobio-900/20 transition-colors"><item.icon className="w-5 h-5" /></div><span className="font-semibold text-slate-700 dark:text-slate-200 text-base">{item.label}</span></div><ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-wobio-500 transition-colors" /></button>))}<button onClick={onLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors"><LogOut className="w-5 h-5" /></div><span className="font-semibold text-slate-700 dark:text-slate-200 text-base group-hover:text-red-600 transition-colors">Log Out</span></div></button></div></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
          <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${currentRole === 'DRIVER' ? 'bg-wobio-500 text-white shadow-lg shadow-wobio-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'}`}>
              <div>
                  <div className="font-bold text-lg">Driver Mode</div>
                  <div className={`text-xs ${currentRole === 'DRIVER' ? 'text-wobio-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {userProfile.driverVerificationStatus === 'APPROVED' 
                          ? (currentRole === 'DRIVER' ? 'Switch back to Rider' : 'Switch to Driver Interface') 
                          : 'Complete Zimbabwean KYC to enable'}
                  </div>
              </div>
              <div onClick={handleDriverToggle} className={`w-14 h-8 rounded-full flex items-center px-1 cursor-pointer transition-colors duration-300 ${currentRole === 'DRIVER' ? 'bg-white/30' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${currentRole === 'DRIVER' ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
          </div>
      </div>
    </div>
  );
};