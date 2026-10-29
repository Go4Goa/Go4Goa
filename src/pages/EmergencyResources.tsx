import { Link } from 'react-router-dom';
import { Ambulance, ArrowLeft, ArrowUpRight, Baby, Flame, HeartHandshake, Phone, Shield, Siren, Users, Zap } from 'lucide-react';

const services = [
  { name: 'Fire & rescue', number: '112', Icon: Flame },
  { name: 'Electricity helpline', number: '1912', Icon: Zap },
];

export default function EmergencyResources() {
  return <div className="resource-guide resource-emergency">
    <Link className="resource-back" to="/resources"><ArrowLeft size={17} aria-hidden="true" />Resources</Link>
    <h1>Infrastructure emergencies</h1><p>For an immediate danger from fire or damaged infrastructure. Tap a number to call.</p>
    <a className="resource-phone resource-phone-primary" href="tel:112" aria-label="Call all emergencies on 112"><Siren size={24} aria-hidden="true" /><span>All emergencies</span><strong>112</strong><Phone size={20} aria-hidden="true" /></a>
    <ul className="resource-phone-list">{services.map(({ name, number, Icon }) => <li key={name}><a className="resource-phone" href={`tel:${number}`} aria-label={`Call ${name.toLowerCase()} on ${number}`}><Icon size={22} aria-hidden="true" /><span>{name}</span><strong>{number}</strong><Phone size={18} aria-hidden="true" /></a></li>)}</ul>
    <footer className="resource-provenance"><p>Sources: <a href="https://northgoa.gov.in/helpline/" target="_blank" rel="noreferrer">North Goa helplines <ArrowUpRight size={13} aria-hidden="true" /></a>, <a href="https://goa-tourism.com/important-numbers/" target="_blank" rel="noreferrer">Goa Tourism <ArrowUpRight size={13} aria-hidden="true" /></a> and <a href="https://112.gov.in/" target="_blank" rel="noreferrer">112 India <ArrowUpRight size={13} aria-hidden="true" /></a>.</p><p>Official listings checked 29 October 2026. Calls and service response have not been tested.</p></footer>
  </div>;
}
