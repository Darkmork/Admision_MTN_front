import React, { useState, useMemo, useCallback } from 'react';
import { FiChevronDown, FiSearch, FiFilter, FiDownload, FiRefreshCw, FiX } from 'react-icons/fi';
import Button from './Button';
import Input from './Input';
import AdvancedPagination from './AdvancedPagination';

export interface TableColumn<T = any> {
    key: string;
    title: string;
    dataIndex: keyof T;
    width?: number;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'date' | 'number' | 'boolean';
    filterOptions?: Array<{ label: string; value: any }>;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T = any> {
    columns: TableColumn<T>[];
    data: T[];
    loading?: boolean;
    pagination?: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize: number) => void;
        pageSizeOptions?: number[];
        showSizeChanger?: boolean;
        showQuickJumper?: boolean;
        showTotal?: boolean;
        simple?: boolean;
    };
    onRefresh?: () => void;
    onExport?: () => void;
    title?: string;
    actions?: React.ReactNode;
    rowKey?: keyof T | ((record: T) => string | number);
    className?: string;
    virtualScrolling?: boolean;
    rowHeight?: number;
    maxHeight?: number;
}

interface FilterState {
    [key: string]: {
        type: 'text' | 'select' | 'date' | 'number' | 'boolean';
        value: any;
        operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
    };
}

interface SortState {
    field: string | null;
    direction: 'asc' | 'desc' | null;
}

const DataTable = <T extends Record<string, any>>({
    columns,
    data,
    loading = false,
    pagination,
    onRefresh,
    onExport,
    title,
    actions,
    rowKey = 'id',
    className = '',
    virtualScrolling = false,
    rowHeight = 60,
    maxHeight = 600
}: DataTableProps<T>) => {
    const [filters, setFilters] = useState<FilterState>({});
    const [sort, setSort] = useState<SortState>({ field: null, direction: null });
    const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Obtener opciones únicas para filtros select
    const getUniqueValues = useCallback((dataIndex: keyof T) => {
        const uniqueValues = [...new Set(data.map(item => item[dataIndex]))]
            .filter(val => val !== null && val !== undefined && val !== '')
            .sort();
        
        return uniqueValues.map(value => ({
            label: String(value),
            value: value
        }));
    }, [data]);

    // Aplicar filtros
    const filteredData = useMemo(() => {
        let result = [...data];

        // Aplicar búsqueda global
        if (searchTerm) {
            result = result.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Aplicar filtros por columna
        Object.entries(filters).forEach(([field, filter]) => {
            if (!filter.value && filter.value !== 0 && filter.value !== false) return;

            result = result.filter(item => {
                const itemValue = item[field];
                const filterValue = filter.value;

                switch (filter.type) {
                    case 'text':
                        const strValue = String(itemValue).toLowerCase();
                        const strFilter = String(filterValue).toLowerCase();
                        
                        switch (filter.operator) {
                            case 'equals':
                                return strValue === strFilter;
                            case 'startsWith':
                                return strValue.startsWith(strFilter);
                            case 'endsWith':
                                return strValue.endsWith(strFilter);
                            case 'contains':
                            default:
                                return strValue.includes(strFilter);
                        }
                    
                    case 'select':
                        return itemValue === filterValue;
                    
                    case 'number':
                        const numValue = Number(itemValue);
                        const numFilter = Number(filterValue);
                        
                        switch (filter.operator) {
                            case 'equals':
                                return numValue === numFilter;
                            case 'gt':
                                return numValue > numFilter;
                            case 'lt':
                                return numValue < numFilter;
                            case 'gte':
                                return numValue >= numFilter;
                            case 'lte':
                                return numValue <= numFilter;
                            default:
                                return numValue === numFilter;
                        }
                    
                    case 'boolean':
                        return Boolean(itemValue) === Boolean(filterValue);
                    
                    case 'date':
                        // Implementar filtros de fecha según necesidad
                        return true;
                    
                    default:
                        return true;
                }
            });
        });

        return result;
    }, [data, filters, searchTerm]);

    // Aplicar ordenamiento
    const sortedData = useMemo(() => {
        if (!sort.field || !sort.direction) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sort.field!];
            const bValue = b[sort.field!];

            if (aValue === bValue) return 0;

            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return sort.direction === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sort]);

    // Manejar ordenamiento
    const handleSort = (field: string) => {
        if (sort.field === field) {
            // Cambiar dirección: asc -> desc -> none
            if (sort.direction === 'asc') {
                setSort({ field, direction: 'desc' });
            } else if (sort.direction === 'desc') {
                setSort({ field: null, direction: null });
            }
        } else {
            setSort({ field, direction: 'asc' });
        }
    };

    // Manejar filtros
    const handleFilter = (field: string, value: any, type: string, operator = 'contains') => {
        if (!value && value !== 0 && value !== false) {
            // Remover filtro
            const newFilters = { ...filters };
            delete newFilters[field];
            setFilters(newFilters);
        } else {
            setFilters(prev => ({
                ...prev,
                [field]: { type: type as any, value, operator: operator as any }
            }));
        }
    };

    // Limpiar todos los filtros
    const clearAllFilters = () => {
        setFilters({});
        setSearchTerm('');
        setSort({ field: null, direction: null });
    };

    // Componente de filtro por columna
    const ColumnFilter = ({ column }: { column: TableColumn<T> }) => {
        const currentFilter = filters[column.dataIndex as string];
        const isActive = activeFilterColumn === column.dataIndex;

        if (!column.filterable) return null;

        const filterType = column.filterType || 'text';
        const options = column.filterOptions || getUniqueValues(column.dataIndex);

        return (
            <div className="relative">
                <button
                    onClick={() => setActiveFilterColumn(isActive ? null : column.dataIndex as string)}
                    className={`p-1 rounded hover:bg-gray-100 ${
                        currentFilter ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
                    }`}
                >
                    <FiFilter size={14} />
                </button>

                {isActive && (
                    <div className="absolute top-8 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
                        {filterType === 'select' ? (
                            <select
                                value={currentFilter?.value || ''}
                                onChange={(e) => handleFilter(column.dataIndex as string, e.target.value, filterType)}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="">Todos</option>
                                {options.map((option, idx) => (
                                    <option key={idx} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : filterType === 'number' ? (
                            <div className="space-y-2">
                                <select
                                    value={currentFilter?.operator || 'equals'}
                                    onChange={(e) => {
                                        if (currentFilter) {
                                            handleFilter(column.dataIndex as string, currentFilter.value, filterType, e.target.value);
                                        }
                                    }}
                                    className="w-full p-1 border border-gray-300 rounded text-sm"
                                >
                                    <option value="equals">Igual a</option>
                                    <option value="gt">Mayor que</option>
                                    <option value="lt">Menor que</option>
                                    <option value="gte">Mayor o igual</option>
                                    <option value="lte">Menor o igual</option>
                                </select>
                                <input
                                    type="number"
                                    value={currentFilter?.value || ''}
                                    onChange={(e) => handleFilter(column.dataIndex as string, e.target.value, filterType, currentFilter?.operator)}
                                    placeholder="Valor..."
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                        ) : filterType === 'boolean' ? (
                            <select
                                value={currentFilter?.value === undefined ? '' : String(currentFilter.value)}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? null : e.target.value === 'true';
                                    handleFilter(column.dataIndex as string, value, filterType);
                                }}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="">Todos</option>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </select>
                        ) : (
                            <div className="space-y-2">
                                <select
                                    value={currentFilter?.operator || 'contains'}
                                    onChange={(e) => {
                                        if (currentFilter) {
                                            handleFilter(column.dataIndex as string, currentFilter.value, filterType, e.target.value);
                                        }
                                    }}
                                    className="w-full p-1 border border-gray-300 rounded text-sm"
                                >
                                    <option value="contains">Contiene</option>
                                    <option value="equals">Igual a</option>
                                    <option value="startsWith">Empieza con</option>
                                    <option value="endsWith">Termina con</option>
                                </select>
                                <input
                                    type="text"
                                    value={currentFilter?.value || ''}
                                    onChange={(e) => handleFilter(column.dataIndex as string, e.target.value, filterType, currentFilter?.operator)}
                                    placeholder="Buscar..."
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                        )}

                        {currentFilter && (
                            <button
                                onClick={() => handleFilter(column.dataIndex as string, null, filterType)}
                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                                Limpiar filtro
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm;

    return (
        <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <div className="flex items-center gap-2">
                        {actions}
                        {onExport && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onExport}
                                className="flex items-center gap-1"
                            >
                                <FiDownload size={14} />
                                Exportar
                            </Button>
                        )}
                        {onRefresh && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRefresh}
                                className="flex items-center gap-1"
                            >
                                <FiRefreshCw size={14} />
                                Actualizar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Búsqueda global y filtros */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Buscar en todos los campos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                            icon={<FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />}
                        />
                    </div>

                    {hasActiveFilters && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                {Object.keys(filters).length} filtro(s) activo(s)
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                                <FiX size={14} />
                                Limpiar todo
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${
                                        column.width ? `w-[${column.width}px]` : ''
                                    }`}
                                    style={{ width: column.width }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div
                                            className={`flex items-center gap-2 ${
                                                column.sortable ? 'cursor-pointer hover:text-gray-700' : ''
                                            }`}
                                            onClick={() => column.sortable && handleSort(column.dataIndex as string)}
                                        >
                                            <span>{column.title}</span>
                                            {column.sortable && (
                                                <div className="flex flex-col">
                                                    <FiChevronDown
                                                        size={12}
                                                        className={`transform transition-transform ${
                                                            sort.field === column.dataIndex && sort.direction === 'asc'
                                                                ? 'rotate-180 text-blue-600'
                                                                : sort.field === column.dataIndex && sort.direction === 'desc'
                                                                ? 'rotate-0 text-blue-600'
                                                                : 'text-gray-400'
                                                        }`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <ColumnFilter column={column} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                                    <div className="flex items-center justify-center">
                                        <FiRefreshCw className="animate-spin mr-2" />
                                        Cargando...
                                    </div>
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                                    {hasActiveFilters ? 'No se encontraron resultados con los filtros aplicados' : 'No hay datos disponibles'}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((record, index) => {
                                const key = typeof rowKey === 'function' ? rowKey(record) : record[rowKey];
                                return (
                                    <tr key={key} className="hover:bg-gray-50">
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${
                                                    column.align === 'center' ? 'text-center' :
                                                    column.align === 'right' ? 'text-right' : 'text-left'
                                                }`}
                                            >
                                                {column.render
                                                    ? column.render(record[column.dataIndex], record, index)
                                                    : String(record[column.dataIndex] || '')
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación Avanzada */}
            {pagination && (
                <div className="px-4 py-3 border-t border-gray-200">
                    <AdvancedPagination
                        current={pagination.current}
                        total={pagination.total}
                        pageSize={pagination.pageSize}
                        onChange={pagination.onChange}
                        onShowSizeChange={pagination.onChange}
                        pageSizeOptions={pagination.pageSizeOptions || [10, 20, 50, 100]}
                        showSizeChanger={pagination.showSizeChanger !== false}
                        showQuickJumper={pagination.showQuickJumper !== false}
                        showTotal={pagination.showTotal !== false}
                        simple={pagination.simple || false}
                        size="default"
                    />
                </div>
            )}
        </div>
    );
};

export { DataTable };
export default DataTable;