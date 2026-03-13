"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Form, Button, App, DatePicker } from "antd";
import {
  SaveOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import EyeDataForm from "@/components/prescription/EyeDataForm";
import PrescriptionPreview from "@/components/prescription/PrescriptionPreview";
import dayjs from "dayjs";

// Type for old prescription data (no PD - matches WPF behavior)
interface OldPrescriptionData {
  right_lk?: string;
  right_sphere?: string;
  right_cylinder?: string;
  right_axis?: string;
  right_addition?: string;
  right_tl?: string;
  left_lk?: string;
  left_sphere?: string;
  left_cylinder?: string;
  left_axis?: string;
  left_addition?: string;
  left_tl?: string;
  examined_date?: string;
}

export default function NewPrescriptionPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = parseInt(params.id as string);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerInfo, setCustomerInfo] = useState<{
    fullname: string;
    dateofbirth?: Date | string;
    phone_number?: string;
    address?: string;
    gender?: number;
  } | null>(null);
  const [oldPrescData, setOldPrescData] = useState<OldPrescriptionData>({});
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      // Fetch customer info
      const customerRes = await fetch(`/api/customers/${customerId}`);
      const customerData = await customerRes.json();
      if (customerData.success) {
        setCustomerName(customerData.data.fullname);
        setCustomerInfo({
          fullname: customerData.data.fullname,
          dateofbirth: customerData.data.dateofbirth,
          phone_number: customerData.data.phone_number,
          address: customerData.data.address,
          gender: customerData.data.gender,
        });
      } else {
        message.error("Không tìm thấy khách hàng");
        router.back();
        return;
      }

      // Fetch latest prescription to pre-fill "Old Prescription" section
      // This matches the WPF logic in NewCustomerPrescriptionWindow.xaml.cs Load_Data()
      const prescriptionsRes = await fetch(
        `/api/customers/${customerId}/prescriptions`,
      );
      const prescriptionsData = await prescriptionsRes.json();
      if (prescriptionsData.success && prescriptionsData.data.length > 0) {
        // Get the most recent prescription (already sorted by examined_date desc)
        const latestPrescription = prescriptionsData.data[0];

        // Store old prescription data in state for sidebar display
        // Note: PD is NOT included in old prescription section (matches WPF behavior)
        setOldPrescData({
          right_lk: latestPrescription.right_lk || "",
          right_sphere: latestPrescription.right_sphere || "",
          right_cylinder: latestPrescription.right_cylinder || "",
          right_axis: latestPrescription.right_axis?.toString() || "",
          right_addition: latestPrescription.right_addition || "",
          right_tl: latestPrescription.right_tl || "",
          left_lk: latestPrescription.left_lk || "",
          left_sphere: latestPrescription.left_sphere || "",
          left_cylinder: latestPrescription.left_cylinder || "",
          left_axis: latestPrescription.left_axis?.toString() || "",
          left_addition: latestPrescription.left_addition || "",
          left_tl: latestPrescription.left_tl || "",
          examined_date: latestPrescription.examined_date,
        });
        // Old prescription data is stored in state and sent directly on submit
      }
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [customerId, router, form, message]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const prescriptionData = values.prescription as Record<string, unknown>;
      const machineData = values.machinePrescription as Record<string, unknown>;
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          prescription: {
            ...prescriptionData,
            examined_date: values.examined_date
              ? (values.examined_date as dayjs.Dayjs).format("YYYY-MM-DD")
              : null,
            re_examinated_date: prescriptionData?.re_examinated_date
              ? (prescriptionData.re_examinated_date as dayjs.Dayjs).format(
                  "YYYY-MM-DD",
                )
              : null,
          },
          // Use oldPrescData state directly (populated from latest prescription)
          oldPrescription: oldPrescData,
          machinePrescription: machineData || {},
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Tạo đơn thuốc thành công");
        router.push(`/customers/${customerId}`);
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const getPreviewData = () => {
    const formValues = form.getFieldsValue();

    return {
      // Customer info
      fullname: customerInfo?.fullname,
      dateofbirth: customerInfo?.dateofbirth,
      phone_number: customerInfo?.phone_number,
      address: customerInfo?.address,
      gender: customerInfo?.gender,

      // Prescription data
      examined_date: formValues.examined_date
        ? (formValues.examined_date as dayjs.Dayjs).toDate()
        : new Date(),

      // Old prescription (from oldPrescData state)
      old_right_lk: oldPrescData.right_lk,
      old_right_sphere: oldPrescData.right_sphere,
      old_right_cylinder: oldPrescData.right_cylinder,
      old_right_axis: oldPrescData.right_axis
        ? parseInt(oldPrescData.right_axis)
        : undefined,
      old_right_addition: oldPrescData.right_addition,
      old_right_tl: oldPrescData.right_tl,
      old_left_lk: oldPrescData.left_lk,
      old_left_sphere: oldPrescData.left_sphere,
      old_left_cylinder: oldPrescData.left_cylinder,
      old_left_axis: oldPrescData.left_axis
        ? parseInt(oldPrescData.left_axis)
        : undefined,
      old_left_addition: oldPrescData.left_addition,
      old_left_tl: oldPrescData.left_tl,

      // Machine prescription
      machine_right_lk: formValues.machinePrescription?.right_lk,
      machine_right_sphere: formValues.machinePrescription?.right_sphere,
      machine_right_cylinder: formValues.machinePrescription?.right_cylinder,
      machine_right_axis: formValues.machinePrescription?.right_axis,
      machine_right_addition: formValues.machinePrescription?.right_addition,
      machine_right_tl: formValues.machinePrescription?.right_tl,
      machine_left_lk: formValues.machinePrescription?.left_lk,
      machine_left_sphere: formValues.machinePrescription?.left_sphere,
      machine_left_cylinder: formValues.machinePrescription?.left_cylinder,
      machine_left_axis: formValues.machinePrescription?.left_axis,
      machine_left_addition: formValues.machinePrescription?.left_addition,
      machine_left_tl: formValues.machinePrescription?.left_tl,

      // New prescription
      right_lk: formValues.prescription?.right_lk,
      right_sphere: formValues.prescription?.right_sphere,
      right_cylinder: formValues.prescription?.right_cylinder,
      right_axis: formValues.prescription?.right_axis,
      right_addition: formValues.prescription?.right_addition,
      right_tl: formValues.prescription?.right_tl,
      right_pd: formValues.prescription?.right_pd,
      left_lk: formValues.prescription?.left_lk,
      left_sphere: formValues.prescription?.left_sphere,
      left_cylinder: formValues.prescription?.left_cylinder,
      left_axis: formValues.prescription?.left_axis,
      left_addition: formValues.prescription?.left_addition,
      left_tl: formValues.prescription?.left_tl,
      left_pd: formValues.prescription?.left_pd,

      // Frame & Lens
      frame_name: formValues.prescription?.frame_name,
      frame_price: formValues.prescription?.frame_price,
      lense_name: formValues.prescription?.lense_name,
      lense_price: formValues.prescription?.lense_price,

      // Other
      re_examinated_date: formValues.prescription?.re_examinated_date,
      description: formValues.prescription?.description,
      staff_name: formValues.prescription?.staff_name,
    };
  };

  // Use oldPrescData state for sidebar display (populated from API response)

  return (
    <MainLayout>
      {loading ? (
        <>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <Form form={form} className="hidden" />
        </>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Old Prescription History */}
          <aside className="lg:w-1/4 flex flex-col gap-4">
            {/* Back Button */}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/customers/${customerId}`)}
              className="!rounded-md !border-slate-300 w-full"
            >
              Quay lại
            </Button>

            <div className="flex items-center gap-2">
              <HistoryOutlined className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Lịch sử đơn cũ
              </h3>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">
                  {oldPrescData.examined_date
                    ? dayjs(oldPrescData.examined_date).format("DD/MM/YYYY")
                    : "Chưa có đơn cũ"}
                </span>
                {oldPrescData.examined_date && (
                  <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-bold uppercase">
                    Đã hoàn tất
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-3 space-y-4">
                {/* Right Eye (OD) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-l-4 border-green-500 pl-2">
                    <span className="text-xs font-bold text-slate-700">
                      MẮT PHẢI (OD)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      {
                        name: "right_lk",
                        label: "LK",
                        value: oldPrescData.right_lk,
                      },
                      {
                        name: "right_sphere",
                        label: "S",
                        value: oldPrescData.right_sphere,
                      },
                      {
                        name: "right_cylinder",
                        label: "C",
                        value: oldPrescData.right_cylinder,
                      },
                      {
                        name: "right_axis",
                        label: "A",
                        value: oldPrescData.right_axis,
                      },
                      {
                        name: "right_addition",
                        label: "ADD",
                        value: oldPrescData.right_addition,
                      },
                      {
                        name: "right_tl",
                        label: "TL",
                        value: oldPrescData.right_tl,
                      },
                    ].map((field) => (
                      <div key={field.name} className="space-y-0.5">
                        <label className="text-[9px] text-slate-400 font-bold uppercase block text-center">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          value={field.value || ""}
                          onChange={(e) =>
                            setOldPrescData((prev) => ({
                              ...prev,
                              [field.name]: e.target.value,
                            }))
                          }
                          className="w-full rounded px-1 py-1 text-xs bg-slate-50 text-slate-600 font-medium text-center border border-slate-200 focus:border-blue-400 focus:outline-none"
                          placeholder="-"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Left Eye (OS) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-2">
                    <span className="text-xs font-bold text-slate-700">
                      MẮT TRÁI (OS)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      {
                        name: "left_lk",
                        label: "LK",
                        value: oldPrescData.left_lk,
                      },
                      {
                        name: "left_sphere",
                        label: "S",
                        value: oldPrescData.left_sphere,
                      },
                      {
                        name: "left_cylinder",
                        label: "C",
                        value: oldPrescData.left_cylinder,
                      },
                      {
                        name: "left_axis",
                        label: "A",
                        value: oldPrescData.left_axis,
                      },
                      {
                        name: "left_addition",
                        label: "ADD",
                        value: oldPrescData.left_addition,
                      },
                      {
                        name: "left_tl",
                        label: "TL",
                        value: oldPrescData.left_tl,
                      },
                    ].map((field) => (
                      <div key={field.name} className="space-y-0.5">
                        <label className="text-[9px] text-slate-400 font-bold uppercase block text-center">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          value={field.value || ""}
                          onChange={(e) =>
                            setOldPrescData((prev) => ({
                              ...prev,
                              [field.name]: e.target.value,
                            }))
                          }
                          className="w-full rounded px-1 py-1 text-xs bg-slate-50 text-slate-600 font-medium text-center border border-slate-200 focus:border-blue-400 focus:outline-none"
                          placeholder="-"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <SaveOutlined />
                  </span>
                  Nhập đơn thuốc mới
                </h2>
                <div className="flex gap-2">
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    className="!rounded-md !border-green-300 !text-green-600 hover:!bg-green-50"
                  >
                    Xem trước
                  </Button>
                  <Button
                    onClick={() => router.push(`/customers/${customerId}`)}
                    className="!rounded-md !border-slate-300"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={saving}
                    className="!bg-blue-600 hover:!bg-blue-700 !rounded-md !shadow-lg !shadow-blue-200"
                  >
                    Lưu đơn thuốc
                  </Button>
                </div>
              </div>

              {/* Step 1: Machine Refraction */}
              <EyeDataForm
                title="Kết quả đo máy (Refraction)"
                namePrefix="machinePrescription"
                stepNumber={1}
              />

              {/* Step 2: Final Prescription */}
              <div className="mt-6">
                <EyeDataForm
                  title="Chỉ định đơn kính (Final Prescription)"
                  namePrefix="prescription"
                  stepNumber={2}
                  variant="highlight"
                  showFrameLens
                />
              </div>

              {/* Old Prescription data is sent from oldPrescData state, no hidden form needed */}
            </Form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <PrescriptionPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={getPreviewData()}
      />
    </MainLayout>
  );
}
