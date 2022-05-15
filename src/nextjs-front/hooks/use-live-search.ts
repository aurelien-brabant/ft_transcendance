import { useEffect, useMemo, useRef, useState } from 'react';
import { toAscii } from '../utils/string';

export const useLiveSearch = <T>(
    fetchFunction: (searchTerm: string) => Promise<T[]>,
    uniquePredicate: (el: T) => string
) => {
    const searchQueue = useRef<string[]>([]);
    const queryCache = useRef<{ [term: string]: boolean }>({});
    const seenElements = useRef<{ [term: string]: boolean }>({});

    const [elements, setElements] = useState<T[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFetchLocked, setIsFetchLocked] = useState(false);


    const popSearch = async () => {
        setIsFetchLocked(true);
        const searchTerm = searchQueue.current.shift();
        const fetchedElements = await fetchFunction(searchTerm as string);
        const uniqueElements = fetchedElements.filter((el) => {
            const key = uniquePredicate(el);

            if (!seenElements.current[key]) {
                seenElements.current[key] = true;
                return true;
            }

            return false;
        });

        setElements([...uniqueElements, ...elements]);
        setIsFetchLocked(false);
    };

    useEffect(() => {
        if (searchQuery !== '') {
            const normalizedSearchTerm = toAscii(
                searchQuery.trim().toLowerCase()
            );

            if (!queryCache.current[normalizedSearchTerm]) {
                searchQueue.current.push(normalizedSearchTerm);
                queryCache.current[normalizedSearchTerm] = true;

                if (!isFetchLocked) {
                    popSearch();
                }
            }
        }
    }, [searchQuery]);

    useEffect(() => {
        if (searchQueue.current.length > 0 && !isFetchLocked) {
            popSearch();
        }
    }, [isFetchLocked]);


    const isProcessing = useMemo<boolean>(() => isFetchLocked || searchQueue.current.length > 0, [isFetchLocked])

    return { elements, searchQuery, isProcessing, setSearchQuery };
};
