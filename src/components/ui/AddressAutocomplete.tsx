'use client';

import React, { useEffect, useRef, useState } from 'react';
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete';
import styles from './AddressAutocomplete.module.css';

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
    value, 
    onChange, 
    placeholder = "Start typing your address...",
    className
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Load Google Maps Script
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.google) {
            setIsLoaded(true);
            return;
        }

        const scriptId = 'google-maps-script';
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsLoaded(true);
        document.head.appendChild(script);
    }, [apiKey]);

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' || apiKey === '') {
        return <MockAutocompleteComponent value={value} onChange={onChange} placeholder={placeholder} className={className} />;
    }

    if (!isLoaded) return <div className={styles.loading}>Loading Maps...</div>;

    return <AutocompleteComponent value={value} onChange={onChange} placeholder={placeholder} className={className} />;
};

const MOCK_SUGGESTIONS = [
    { main: '254 Fox Street', sub: 'City and Suburban, Johannesburg, 2001' },
    { main: '160 Jan Smuts Avenue', sub: 'Rosebank, Johannesburg, 2196' },
    { main: '88 Maude Street', sub: 'Sandton, Johannesburg, 2196' },
    { main: '5th Street', sub: 'Sandhurst, Sandton, 2196' },
    { main: 'V&A Waterfront', sub: 'Breakwater Blvd, Cape Town, 8001' },
    { main: '93 Long Street', sub: 'Cape Town City Centre, Cape Town, 8001' },
    { main: 'Umhlanga Rocks Drive', sub: 'Umhlanga, KwaZulu-Natal, 4319' },
    { main: 'Florida Road', sub: 'Morningside, Durban, 4001' },
    { main: 'Pretorius Street', sub: 'Hatfield, Pretoria, 0028' },
    { main: 'Lynnwood Road', sub: 'Lynnwood, Pretoria, 0081' },
    { main: 'Main Road', sub: 'Sea Point, Cape Town, 8005' },
    { main: 'Rivonia Road', sub: 'Morningside, Sandton, 2196' },
    { main: 'William Nicol Drive', sub: 'Bryanston, Sandton, 2191' }
];

const MockAutocompleteComponent: React.FC<AddressAutocompleteProps> = ({ 
    value, 
    onChange, 
    placeholder,
    className
}) => {
    const [suggestions, setSuggestions] = useState<typeof MOCK_SUGGESTIONS>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        onChange(query);

        if (query.length > 2) {
            const matches = MOCK_SUGGESTIONS.filter(s => 
                s.main.toLowerCase().includes(query.toLowerCase()) || 
                s.sub.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelect = (s: any) => {
        onChange(`${s.main}, ${s.sub}`);
        setShowSuggestions(false);
    };

    return (
        <div className={`${styles.autocompleteContainer} ${className}`} ref={containerRef}>
            <input
                value={value}
                onChange={handleInput}
                placeholder={placeholder}
                className={styles.input}
                autoComplete="off"
                onFocus={() => value.length > 2 && setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className={styles.suggestionsList}>
                    {suggestions.map((s, i) => (
                        <div key={i} className={styles.suggestionItem} onClick={() => handleSelect(s)}>
                            <span className={styles.suggestionIcon}>📍</span>
                            <div className={styles.suggestionText}>
                                <span className={styles.mainText}>{s.main}</span>
                                <span className={styles.subText}>{s.sub}</span>
                            </div>
                        </div>
                    ))}
                    <div style={{ padding: '8px', borderTop: '1px solid var(--border-color)', textAlign: 'right', fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.5 }}>
                        Demo Mode: Mock Locations Enabled
                    </div>
                </div>
            )}
        </div>
    );
};

const AutocompleteComponent: React.FC<AddressAutocompleteProps> = ({ 
    value, 
    onChange, 
    placeholder,
    className
}) => {
    const {
        ready,
        value: inputValue,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: 'za' }, // Restricted to South Africa by default, can be changed
        },
        debounce: 300,
        defaultValue: value
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange(e.target.value);
        setShowSuggestions(true);
    };

    const handleSelect = ({ description }: any) => {
        setValue(description, false);
        onChange(description);
        clearSuggestions();
        setShowSuggestions(false);
    };

    return (
        <div className={`${styles.autocompleteContainer} ${className}`} ref={containerRef}>
            <input
                value={inputValue}
                onChange={handleInput}
                disabled={!ready}
                placeholder={placeholder}
                className={styles.input}
                autoComplete="off"
                onFocus={() => setShowSuggestions(true)}
            />
            
            {showSuggestions && status === "OK" && (
                <div className={styles.suggestionsList}>
                    {data.map((suggestion) => {
                        const {
                            place_id,
                            structured_formatting: { main_text, secondary_text },
                        } = suggestion;

                        return (
                            <div 
                                key={place_id} 
                                className={styles.suggestionItem}
                                onClick={() => handleSelect(suggestion)}
                            >
                                <span className={styles.suggestionIcon}>📍</span>
                                <div className={styles.suggestionText}>
                                    <span className={styles.mainText}>{main_text}</span>
                                    <span className={styles.subText}>{secondary_text}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div style={{ padding: '8px', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
                        <img 
                            src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png" 
                            alt="Powered by Google"
                            style={{ height: '14px', opacity: 0.7 }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
