"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Form, Button, Popconfirm, Input, DatePicker, App } from "antd";
import {
  SaveOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import EyeDataForm from "@/components/prescription/EyeDataForm";
import PrescriptionPreview from "@/components/prescription/PrescriptionPreview";
import dayjs from "dayjs";

// Type for old prescription data
// No PD in sidebar display - matches WPF behavior
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
}

export default function PrescriptionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refKey, setRefKey] = useState<string>("");
  const [customerInfo, setCustomerInfo] = useState<{
    id: number;
    fullname: string;
    dateofbirth?: Date | string;
    phone_number?: string;
    address?: string;
    gender?: number;
  } | null>(null);
  const [oldPrescData, setOldPrescData] = useState<OldPrescriptionData>({});
  const [hasOldPrescription, setHasOldPrescription] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchPrescription = useCallback(async () => {
    try {
      const res = await fetch(`/api/prescriptions/by-id/${id}`);
      const data = await res.json();
      if (data.success) {
        const { prescription, oldPrescription, machinePrescription } =
          data.data;
        setRefKey(prescription.ref_key);
        setCustomerInfo({
          id: prescription.customer_id,
          fullname: prescription.customer?.fullname,
          dateofbirth: prescription.customer?.dateofbirth,
          phone_number: prescription.customer?.phone_number,
          address: prescription.customer?.address,
          gender: prescription.customer?.gender,
        });

        // Store old prescription data in state for sidebar display
        if (oldPrescription) {
          // Note: PD is NOT included in sidebar display (matches WPF behavior)
          setOldPrescData({
            right_lk: oldPrescription.right_lk || "",
            right_sphere: oldPrescription.right_sphere || "",
            right_cylinder: oldPrescription.right_cylinder || "",
            right_axis: oldPrescription.right_axis?.toString() || "",
            right_addition: oldPrescription.right_addition || "",
            right_tl: oldPrescription.right_tl || "",
            left_lk: oldPrescription.left_lk || "",
            left_sphere: oldPrescription.left_sphere || "",
            left_cylinder: oldPrescription.left_cylinder || "",
            left_axis: oldPrescription.left_axis?.toString() || "",
            left_addition: oldPrescription.left_addition || "",
            left_tl: oldPrescription.left_tl || "",
          });
          setHasOldPrescription(true);
        } else {
          setHasOldPrescription(false);
        }

        form.setFieldsValue({
          examined_date: prescription.examined_date
            ? dayjs(prescription.examined_date)
            : null,
          prescription: {
            ...prescription,
            re_examinated_date: prescription.re_examinated_date
              ? dayjs(prescription.re_examinated_date)
              : null,
          },
          oldPrescription: oldPrescription || {},
          machinePrescription: machinePrescription || {},
        });
      } else {
        message.error("Không tìm thấy đơn thuốc");
        router.back();
      }
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [id, form, router, message]);

  useEffect(() => {
    fetchPrescription();
  }, [fetchPrescription]);

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const prescriptionData = values.prescription as Record<string, unknown>;
      const res = await fetch(`/api/prescriptions/by-id/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescription: {
            ...prescriptionData,
            examined_date: values.examined_date
              ? (values.examined_date as dayjs.Dayjs).format("YYYY-MM-DD")
              : null,
            re_examinated_date: prescriptionData.re_examinated_date
              ? (prescriptionData.re_examinated_date as dayjs.Dayjs).format(
                  "YYYY-MM-DD",
                )
              : null,
          },
          oldPrescription: values.oldPrescription,
          machinePrescription: values.machinePrescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Lưu thành công");
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/prescriptions/by-id/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        message.success("Đã xóa đơn thuốc");
        if (customerInfo) router.push(`/customers/${customerInfo.id}`);
        else router.push("/dashboard");
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("Có lỗi xảy ra");
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
      examined_date: formValues.examined_date,

      // Old prescription
      old_right_lk: formValues.oldPrescription?.right_lk,
      old_right_sphere: formValues.oldPrescription?.right_sphere,
      old_right_cylinder: formValues.oldPrescription?.right_cylinder,
      old_right_axis: formValues.oldPrescription?.right_axis,
      old_right_addition: formValues.oldPrescription?.right_addition,
      old_right_tl: formValues.oldPrescription?.right_tl,
      old_left_lk: formValues.oldPrescription?.left_lk,
      old_left_sphere: formValues.oldPrescription?.left_sphere,
      old_left_cylinder: formValues.oldPrescription?.left_cylinder,
      old_left_axis: formValues.oldPrescription?.left_axis,
      old_left_addition: formValues.oldPrescription?.left_addition,
      old_left_tl: formValues.oldPrescription?.left_tl,

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

  if (loading)
    return (
      <MainLayout>
        <div className="text-center py-12">Đang tải...</div>
        {/* Hidden form to connect useForm */}
        <Form form={form} className="hidden" />
      </MainLayout>
    );

  // Use oldPrescData state for sidebar display (populated from API response)

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Old Prescription */}
        <aside className="lg:w-1/4 flex flex-col gap-4">
          {/* Back Button */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              customerInfo
                ? router.push(`/customers/${customerInfo.id}`)
                : router.back()
            }
            className="!rounded-md !border-slate-300 w-full"
          >
            Quay lại
          </Button>

          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Đơn cũ (Old Prescription)
            </h3>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">{refKey}</span>
              <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-bold uppercase">
                Đơn cũ
              </span>
            </div>

            {/* Content */}
            <div className="p-3 space-y-4">
              {hasOldPrescription ? (
                <>
                  {/* Right Eye (OD) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 border-l-4 border-green-500 pl-2">
                      <span className="text-xs font-bold text-slate-700">
                        MẮT PHẢI (OD)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: "LK", value: oldPrescData.right_lk },
                        { label: "S", value: oldPrescData.right_sphere },
                        { label: "C", value: oldPrescData.right_cylinder },
                        { label: "A", value: oldPrescData.right_axis },
                        { label: "ADD", value: oldPrescData.right_addition },
                        { label: "TL", value: oldPrescData.right_tl },
                      ].map((field) => (
                        <div
                          key={`right_${field.label}`}
                          className="space-y-0.5"
                        >
                          <label className="text-[9px] text-slate-400 font-bold uppercase block text-center">
                            {field.label}
                          </label>
                          <div className="w-full rounded px-1 py-1 text-xs bg-slate-50 text-slate-600 font-medium text-center">
                            {field.value || "-"}
                          </div>
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
                        { label: "LK", value: oldPrescData.left_lk },
                        { label: "S", value: oldPrescData.left_sphere },
                        { label: "C", value: oldPrescData.left_cylinder },
                        { label: "A", value: oldPrescData.left_axis },
                        { label: "ADD", value: oldPrescData.left_addition },
                        { label: "TL", value: oldPrescData.left_tl },
                      ].map((field) => (
                        <div
                          key={`left_${field.label}`}
                          className="space-y-0.5"
                        >
                          <label className="text-[9px] text-slate-400 font-bold uppercase block text-center">
                            {field.label}
                          </label>
                          <div className="w-full rounded px-1 py-1 text-xs bg-slate-50 text-slate-600 font-medium text-center">
                            {field.value || "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm font-medium">Chưa có đơn cũ</p>
                  <p className="text-xs mt-1">
                    Đây là đơn đầu tiên của khách hàng
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <Form form={form} layout="vertical" onFinish={handleSave}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <SaveOutlined />
                  </span>
                  Chi tiết đơn thuốc
                </h2>
                {customerInfo && (
                  <p className="text-sm text-slate-500 mt-1 ml-12">
                    <UserOutlined className="mr-1" />
                    {customerInfo.fullname}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  className="!rounded-md !border-green-300 !text-green-600 hover:!bg-green-50"
                >
                  Xem trước
                </Button>
                <Popconfirm
                  title="Xác nhận xóa đơn thuốc này?"
                  description="Hành động này không thể hoàn tác"
                  onConfirm={handleDelete}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    className="!rounded-md !border-red-300"
                  >
                    Xóa
                  </Button>
                </Popconfirm>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
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

            {/* Additional Info */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <h3 className="font-bold text-slate-800">Thông tin bổ sung</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <CalendarOutlined /> NGÀY KHÁM
                    </label>
                    <Form.Item name="examined_date" noStyle>
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="w-full !rounded-md !border-slate-300"
                        placeholder="Chọn ngày khám"
                      />
                    </Form.Item>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <CalendarOutlined /> NGÀY TÁI KHÁM
                    </label>
                    <Form.Item
                      name={["prescription", "re_examinated_date"]}
                      noStyle
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="w-full !rounded-md !border-slate-300"
                        placeholder="Chọn ngày tái khám"
                      />
                    </Form.Item>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 font-medium">
                      NHÂN VIÊN
                    </label>
                    <Form.Item name={["prescription", "staff_name"]} noStyle>
                      <Input
                        placeholder="Tên nhân viên"
                        className="!rounded-md !border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 font-medium">
                      GHI CHÚ
                    </label>
                    <Form.Item name={["prescription", "description"]} noStyle>
                      <Input
                        placeholder="Ghi chú thêm..."
                        className="!rounded-md !border-slate-300"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden Old Prescription Form for submission */}
            <div className="hidden">
              <EyeDataForm title="Đơn cũ" namePrefix="oldPrescription" />
            </div>
          </Form>
        </div>
      </div>

      {/* Preview Modal */}
      <PrescriptionPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={getPreviewData()}
      />
    </MainLayout>
  );
}
