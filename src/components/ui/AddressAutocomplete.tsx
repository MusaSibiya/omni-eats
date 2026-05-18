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

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        return (
            <div className={styles.autocompleteContainer}>
                <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className={styles.input}
                    placeholder="⚠️ Please add your Google Maps API Key to .env"
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginTop: '4px' }}>
                    Google Maps API Key is missing. Check your .env file.
                </p>
            </div>
        );
    }

    if (!isLoaded) return <div className={styles.loading}>Loading Google Maps...</div>;

    return <AutocompleteComponent value={value} onChange={onChange} placeholder={placeholder} className={className} />;
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
