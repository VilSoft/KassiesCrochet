"use client"

import React, { useEffect, useState } from 'react'
import { pattern } from '@/interfaces';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setPatterns, getPatterns } from '@/redux/features/patternSlice';
import { WhichOpen } from './enums';
import { 
    getSearchParam, 
    getAddPatternIsOpen, 
    getIsPatternOpen, 
    setIsPatternOpen 
} from '@/redux/features/patternListSlice';
import Modal from './Modal';
import AddPatternForm from './AddPatternForm'
import ShowPattern from './ShowPattern';
import style from '@/styles/List.module.css'
import Image from 'next/image';

function Patterns() {
    const dispatch = useDispatch<AppDispatch>();
    const patterns = useSelector(getPatterns);
    const search = useSelector(getSearchParam);
    const isOpen = useSelector(getAddPatternIsOpen);
    const isPatternOpen = useSelector(getIsPatternOpen);

    const [gotPatterns, setGotPatterns] = useState<boolean>(false);
    const [openPattern, setOpenPattern] = useState<pattern>(patterns[0]);

    const handleOpenPattern = (r: pattern) => {
        setOpenPattern(r);
        dispatch(setIsPatternOpen(true));
    }

    // const handleSearch = (value: string) => {
    //     setSearch(value);
    // }

    // Get the patterns and conversions from the database
    useEffect(() => {
        if (gotPatterns) return;

        const getPatterns = async () => {
            const res = await fetch('/api/pattern', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            res.json().then((data) => {
                dispatch(setPatterns(data));
                setGotPatterns(true);
            })
        }

        getPatterns();
    }, [gotPatterns, dispatch])

    return (
        <div className="flex justify-center items-start h-screen p-4">
            <div className='w-[10px]'></div>
            <div className={style.container}>
                {patterns.filter((r: any) => r.name.includes(search)).map((pattern: any) => (
                    <li key={pattern._id} className={`${style.list} flex justify-start items-start`} onClick={() => handleOpenPattern(pattern)}>
                        {pattern.image !== "" && <Image width={0} height={0} sizes='100vh' src={`/api/uploads/${pattern.image}`} alt={pattern.image} className={style.image} />}
                        &nbsp;{pattern.name}
                    </li>
                ))}
            </div>
            <Modal title="Add a Pattern" isOpen={isOpen} type={WhichOpen.add}>
                <AddPatternForm />
            </Modal>
            <Modal title={openPattern?.name} isOpen={isPatternOpen} type={WhichOpen.show}>
                <ShowPattern pattern={openPattern} />
            </Modal>
        </div>
    )
}

export default Patterns