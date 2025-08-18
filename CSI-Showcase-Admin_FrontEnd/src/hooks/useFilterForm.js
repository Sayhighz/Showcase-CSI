import { useCallback, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';

export const normalizeFiltersToForm = (filters = {}, dateRangeField = 'dateRange') => {
  const initialValues = { ...filters };

  // Convert startDate/endDate (string or Date/dayjs) -> dateRange [dayjs, dayjs]
  if (filters.startDate && filters.endDate) {
    const start = typeof filters.startDate === 'object' ? dayjs(filters.startDate) : dayjs(String(filters.startDate));
    const end = typeof filters.endDate === 'object' ? dayjs(filters.endDate) : dayjs(String(filters.endDate));
    initialValues[dateRangeField] = [start, end];

    // Ensure these don't conflict with controlled fields
    delete initialValues.startDate;
    delete initialValues.endDate;
  }

  return initialValues;
};

export const formatFormToFilters = (values = {}, dateRangeField = 'dateRange') => {
  const out = { ...values };

  // dateRange -> startDate/endDate
  if (out[dateRangeField] && Array.isArray(out[dateRangeField]) && out[dateRangeField].length === 2) {
    const [start, end] = out[dateRangeField];
    out.startDate = start?.format ? start.format('YYYY-MM-DD') : start;
    out.endDate = end?.format ? end.format('YYYY-MM-DD') : end;
  }
  delete out[dateRangeField];

  // Remove empty values (undefined, empty string)
  Object.keys(out).forEach((k) => {
    if (out[k] === undefined || out[k] === '') {
      delete out[k];
    }
  });

  return out;
};

export default function useFilterForm({ filters = {}, onFilter, onReset, dateRangeField = 'dateRange', form }) {
  const initialFormValues = useMemo(
    () => normalizeFiltersToForm(filters, dateRangeField),
    [filters, dateRangeField]
  );

  const handleFinish = useCallback(
    (values) => {
      const formatted = formatFormToFilters(values, dateRangeField);
      if (onFilter) onFilter(formatted);
    },
    [onFilter, dateRangeField]
  );

  const handleReset = useCallback(() => {
    if (form?.resetFields) form.resetFields();
    if (onReset) onReset();
  }, [form, onReset]);

  // Keep form fields in sync when filters change
  useEffect(() => {
    if (form?.setFieldsValue) {
      form.setFieldsValue(initialFormValues);
    }
  }, [form, initialFormValues]);

  return { initialFormValues, handleFinish, handleReset };
}